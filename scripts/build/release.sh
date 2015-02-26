#!/bin/bash

# Copyright 2015 Telefonica Investigacion y Desarrollo, S.A.U
#
# This file is part of the perseo-fe.
#
# the perseo-fe is free software: you can redistribute it and/or
# modify it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# the perseo-fe is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
# General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with the perseo. If not, see http://www.gnu.org/licenses/.
#
# For those usages not covered by this license please contact with
# iot_support at tid dot es

# ------------------------------------------------------------------------------
#
# Example execution:
#   scripts/build/release.sh 0.3.0 dev
#
progName=$0
CHANGELOG_FILE="CHANGES_NEXT_RELEASE"

#
# usage
#
function usage
{
  cat <<EOF

Usage:
   $progName <NEW_VERSION> [dev | cc | sprint]
        Creates a new release changing the version to the one specified in the arguments.
        The second argument indicates what type of release is it going to be released:

        - sprint: releases that are meant to be created each sprint end. A tag is automatically
        generated along with the branch and develop is merged with master.

        - cc: code complete releases meant to be created when the product is about to go
        into production with the rest of the platform. No tag is generated and master is not
        updated.

        - dev: intermediate releases that do not require following the same SCM specs.

EOF

  exit 1
}



#
# Chewcking command line parameters
#
if [ "$1" == "-u" ]
then
  usage
fi

if [ $# != 2 ]
then
  usage
fi


#
# Command line parameters
#
export NEW_VERSION=$1
export PERSEO_RELEASE=$2

#
# correct date format
#
DATE=$(LANG=C date +"%a %b %d %Y")
export dateLine="$DATE Daniel Moran <daniel.moranjimenez@telefonica.com> ${NEW_VERSION}"


# Modify rpm/SPECS/cep.spec only when step to a non-devel release
if [ "$PERSEO_RELEASE" != "dev" ]
then
    #
    # Edit rpm/SPECS/cep.spec, adding the new changes from CHANGELOG_FILE
    #
    # 1. Find the line in rpm/SPECS/cep.spec, where to add the content of CHANGELOG_FILE plus the info-line for the changes.
    #    o LINES:       number of lines before the insertion
    # 2. Get the total number of lines in rpm/SPECS/cep.spec
    # 3. Get the number of lines in rpm/SPECS/cep.spec after the insertion
    #    o LAST_LINES:  number of lines after the insertion
    # 4. To a temporal file, add the four 'chunks':
    #    1. LINES
    #    2. the info-line for the changes
    #    3. the content of CHANGELOG_FILE
    #    4. LAST_LINES
    # 5. Replace using the temporal file

    #
    # 1. Find the line in rpm/SPECS/cep.spec, where to add the content of CHANGELOG_FILE
    #    The for is because these is more than one oceuurence of '%changelog'. We are only
    #    interested in the last one.
    #
    for line in $(grep -n '%changelog' rpm/SPECS/cep.spec | awk -F: '{ print $1 }')
    do
      LINE=$line
    done


    #
    # 2. Get the total number of lines in rpm/SPECS/cep.spec
    #
    LINES=$(wc -l  < rpm/SPECS/cep.spec)


    #
    # 3. Get the number of lines in rpm/SPECS/cep.spec after the insertion
    #
    LAST_LINES=$(($LINES-$LINE))


    #
    # 4. To a temporal file, add the four 'chunks'
    #
    head -$LINE rpm/SPECS/cep.spec             >  /tmp/cep.spec

    echo -n '* '                                    >> /tmp/cep.spec
    echo $dateLine                                  >> /tmp/cep.spec

    cat $CHANGELOG_FILE                             >> /tmp/cep.spec
    echo                                            >> /tmp/cep.spec

    tail -$LAST_LINES rpm/SPECS/cep.spec       >> /tmp/cep.spec
    
    # 5. Replace using the temporal file
    mv /tmp/cep.spec rpm/SPECS/cep.spec 

fi


#
# Get the current version (maintained in src/app/contextBroker/version.h)
#
currentVersion=$(cat package.json  |grep version |awk '{print $2}'|tr -d "\"" | tr -d ",")

echo "current version: $currentVersion"
echo "new version:     $NEW_VERSION"


#
# Edit files that depend on the current version (which just changed)
#
sed "s/\"version\": \"$currentVersion\"/\"version\": \"$NEW_VERSION\"/" package.json        > /tmp/package.json
sed "s/$currentVersion/$NEW_VERSION/" rpm/create-rpm.sh        > /tmp/create-rpm.sh

mv /tmp/package.json              package.json
mv /tmp/create-rpm.sh             rpm/create-rpm.sh


# Clean the inter-release changes file
rm -rf $CHANGELOG_FILE
touch $CHANGELOG_FILE

#
# Do the git stuff only if we are in develop branch
#
CURRENT_BRANCH=$(git branch | grep '^*' | cut -c 3-10)
if [ "$CURRENT_BRANCH" == "develop" ]
then
    git add rpm/SPECS/cep.spec
    git add rpm/create-rpm.sh
    git add package.json
    git add CHANGES_NEXT_RELEASE
    git commit -m "ADD Step: $currentVersion -> $NEW_VERSION"
    git push origin develop

    # We do the tag only and merge to master only in the case of  non "dev" release
    if [ "$PERSEO_RELEASE" = "sprint" ]
    then
       git checkout master
       git pull origin master
       git merge develop
       git push origin master
       git checkout -b release/$NEW_VERSION
       git tag $NEW_VERSION
       git push --tags origin release/$NEW_VERSION
       git checkout $CURRENT_BRANCH
    elif [ "$PERSEO_RELEASE" = "cc" ]
    then
       git checkout -b release/$NEW_VERSION
       git push origin release/$NEW_VERSION
       git checkout $CURRENT_BRANCH
    fi

    #
    # Prepare develop for the next version
    #
    sed "s/\"version\": \"$NEW_VERSION\"/\"version\": \"$NEW_VERSION-next\"/" package.json        > /tmp/package.json
    sed "s/$NEW_VERSION/$NEW_VERSION-next/" rpm/create-rpm.sh        > /tmp/create-rpm.sh
    mv /tmp/package.json              package.json
    mv /tmp/create-rpm.sh             rpm/create-rpm.sh

    git add rpm/create-rpm.sh
    git add package.json
    git commit -m "ADD Prepare new version numbers for develop"
    git push origin develop

else
    echo "Your current branch is $CURRENT_BRANCH. You need to be at develop branch to do the final part of the process"
fi

