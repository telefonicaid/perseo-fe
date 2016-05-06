FROM centos:6

RUN yum update -y && yum install -y wget \
  && wget https://dl.fedoraproject.org/pub/epel/epel-release-latest-6.noarch.rpm && yum localinstall -y --nogpgcheck epel-release-latest-6.noarch.rpm \
  && yum install -y npm git 

COPY . /opt/perseo-fe
WORKDIR /opt/perseo-fe
RUN npm install

EXPOSE 9090

ENV PERSEO_MONGO_HOST=mongodb
ENV PERSEO_CORE_URL=http://corehost:8080

CMD bin/perseo
