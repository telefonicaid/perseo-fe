# Copyright 2015 Telefonica Investigacion y Desarrollo, S.A.U
#
# This file is part of perseo-fe
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

# FIXME: we remove grunt in Perseo FE 1.8.0. Thus, this script is now broken
# and should be reworked in terms of "npm run" scripts. However, not a big
# problem, as this script has not been used for years.

grunt lint-report --force > /dev/null 2>&1
ERRORS_GJSLINT=$(cat report/lint/gjslint.xml | grep issue | wc -l)
ERRORS_JSLINT=$(cat report/lint/jshint-lib.xml | grep error | wc -l)
STYLE_ERRORS=$(echo $ERRORS_GJSLINT + $ERRORS_JSLINT | bc)
PERSEO_STYLE=$(echo "scale=2 ; 100 - ($STYLE_ERRORS * 100 / $PERSEO_LINES)" | bc)
echo ERRORS_GJSLINT $ERRORS_GJSLINT
echo ERRORS_JSLINT $ERRORS_JSLINT
echo STYLE_ERRORS $STYLE_ERRORS
echo PERSEO_STYLE $PERSEO_STYLE


