#
# Copyright 2016 Telefonica Investigación y Desarrollo, S.A.U
#
# This file is part of perseo-fe
#
# perseo-fe is free software: you can redistribute it and/or modify it under the terms of the GNU Affero
# General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your
# option) any later version.
# perseo-fe is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
# implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License
# for more details.
#
# You should have received a copy of the GNU Affero General Public License along with perseo-fe. If not, see
# http://www.gnu.org/licenses/.
#
# For those usages not covered by the GNU Affero General Public License please contact with iot_support at tid dot es
#

FROM node:8.16.0-slim

MAINTAINER FIWARE Perseo Team. TelefÃ³nica I+D

COPY . /opt/perseo-fe/
WORKDIR /opt/perseo-fe

RUN \
  apt-get update && \
  apt-get install -y git && \
  npm install pm2@3.2.2 -g && \
  echo "INFO: npm install --production..." && \
  cd /opt/perseo-fe && npm install --production && \
  # Clean apt cache
  apt-get clean && \
  apt-get remove -y git && \
  apt-get -y autoremove

EXPOSE 9090

ENV PERSEO_MONGO_HOST=mongodb
ENV PERSEO_CORE_URL=http://corehost:8080

USER node
ENV NODE_ENV=production

HEALTHCHECK CMD curl --fail http://localhost:9090/version || exit 1

ENTRYPOINT ["pm2-runtime", "bin/perseo"]
CMD ["-- ", "config.js"]
