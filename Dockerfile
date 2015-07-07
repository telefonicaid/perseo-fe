FROM centos:6

RUN yum update -y && yum install -y wget \
  && wget http://ftp.rediris.es/mirror/fedora-epel/6/i386/epel-release-6-8.noarch.rpm && yum localinstall -y --nogpgcheck epel-release-6-8.noarch.rpm \
  && yum install -y npm git 

WORKDIR /opt
RUN git clone https://github.com/telefonicaid/perseo-fe.git && cd perseo-fe && git checkout develop && npm install

EXPOSE 9090
WORKDIR /opt/perseo-fe

ENV PERSEO_MONGO_HOST=mongodb
ENV PERSEO_CORE_URL=http://corehost:8080

CMD bin/perseo

