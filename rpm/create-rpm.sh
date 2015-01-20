#!/bin/bash

# Copyright 2015 Telefonica Investigacion y Desarrollo, S.A.U
#
# This file is part of perseo-fe.
#
# perseo-fe is free software: you can redistribute it and/or
# modify it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# perseo-fe is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
# General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with perseo-fe. If not, see http://www.gnu.org/licenses/.
#
# For those usages not covered by this license please contact with
# iot_support at tid dot es

CEP_VERSION=$2
if [ -z "$CEP_VERSION" ]; then
  CEP_VERSION=0.4.0_next
fi
CEP_RELEASE=$1
if [ -z "$CEP_RELEASE" ]; then
  CEP_RELEASE=0
fi
FIWARE_VERSION=1.0
FIWARE_RELEASE=1
RPM_TOPDIR=$PWD
CEP_USER=cep

rpmbuild -ba $RPM_TOPDIR/SPECS/cep.spec \
    --define "_topdir $RPM_TOPDIR" \
    --define "_project_user $CEP_USER" \
    --define "_product_version $CEP_VERSION" \
    --define "_product_release $CEP_RELEASE" \
    --define "fiware_version $FIWARE_VERSION" \
    --define "fiware_release $FIWARE_RELEASE"
