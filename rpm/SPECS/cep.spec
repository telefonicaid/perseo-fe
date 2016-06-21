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

Summary: Perseo Complex Event Processing
Name: perseo-cep
Version: %{_product_version}
Release: %{_product_release}
License: AGPLv3
BuildRoot: %{_topdir}/BUILDROOT/
BuildArch: x86_64
# Requires: nodejs >= 0.10.24
Requires: logrotate
Requires(post): /sbin/chkconfig, /usr/sbin/useradd npm
Requires(preun): /sbin/chkconfig, /sbin/service
Requires(postun): /sbin/service
Group: Applications/Engineering
Vendor: Telefonica I+D
BuildRequires: npm

%description
Perseo is the Complex Event Process for IoT platform.

# System folders
%define _srcdir $RPM_BUILD_ROOT/../../..
%define _service_name perseo
%define _install_dir /opt/perseo
%define _perseoCep_log_dir /var/log/perseo

# RPM Building folder
%define _build_root_project %{buildroot}%{_install_dir}
# -------------------------------------------------------------------------------------------- #
# prep section, setup macro:
# -------------------------------------------------------------------------------------------- #
%prep
echo "[INFO] Preparing installation"
# Create rpm/BUILDROOT folder
rm -Rf $RPM_BUILD_ROOT && mkdir -p $RPM_BUILD_ROOT
[ -d %{_build_root_project} ] || mkdir -p %{_build_root_project}

# Copy src files
cp -R %{_srcdir}/lib \
      %{_srcdir}/bin \
      %{_srcdir}/config.js \
      %{_srcdir}/package.json \
      %{_build_root_project}

cp -R %{_topdir}/SOURCES/etc %{buildroot}

# -------------------------------------------------------------------------------------------- #
# Build section:
# -------------------------------------------------------------------------------------------- #
%build
echo "[INFO] Building RPM"
cd %{_build_root_project}

# Only production modules
rm -fR node_modules/
npm cache clear
npm install --production

# -------------------------------------------------------------------------------------------- #
# pre-install section:
# -------------------------------------------------------------------------------------------- #
%pre
echo "[INFO] Creating %{_project_user} user"
grep ^%{_project_user}: /etc/passwd
RET_VAL=$?
if [ "$RET_VAL" != "0" ]; then
      /usr/sbin/useradd -s "/bin/bash" -d %{_install_dir} %{_project_user}
      RET_VAL=$?
      if [ "$RET_VAL" != "0" ]; then
         echo "[ERROR] Unable create %{_project_user} user" \
         exit $RET_VAL
      fi
fi

# -------------------------------------------------------------------------------------------- #
# post-install section:
# -------------------------------------------------------------------------------------------- #
%post
echo "[INFO] Configuring application"

    echo "[INFO] Creating the home Perseo directory"
    mkdir -p _install_dir
    echo "[INFO] Creating log directory"
    mkdir -p %{_perseoCep_log_dir}
    chown -R %{_project_user}:%{_project_user} %{_perseoCep_log_dir}
    chown -R %{_project_user}:%{_project_user} _install_dir
    chmod g+s %{_perseoCep_log_dir}
    setfacl -d -m g::rwx %{_perseoCep_log_dir}
    setfacl -d -m o::rx %{_perseoCep_log_dir}

    echo "[INFO] Configuring application service"
    cd /etc/init.d
    chkconfig --add %{_service_name}

echo "Done"

# -------------------------------------------------------------------------------------------- #
# pre-uninstall section:
# -------------------------------------------------------------------------------------------- #
%preun

echo "[INFO] stoping service %{_service_name}"
service %{_service_name} stop &> /dev/null

if [ $1 == 0 ]; then

  echo "[INFO] Removing application log files"
  # Log
  [ -d %{_perseoCep_log_dir} ] && rm -rfv %{_perseoCep_log_dir}

  echo "[INFO] Removing application files"
  # Installed files
  [ -d %{_install_dir} ] && rm -rfv %{_install_dir}

  echo "[INFO] Removing application user"
  userdel -fr %{_project_user}

  echo "[INFO] Removing application service"
  chkconfig --del %{_service_name}
  rm -Rf /etc/init.d/%{_service_name}
  echo "Done"
fi

# -------------------------------------------------------------------------------------------- #
# post-uninstall section:
# clean section:
# -------------------------------------------------------------------------------------------- #
%postun
%clean
rm -rf $RPM_BUILD_ROOT

# -------------------------------------------------------------------------------------------- #
# Files to add to the RPM
# -------------------------------------------------------------------------------------------- #
%files
%defattr(755,%{_project_user},%{_project_user},755)
%config /etc/init.d/%{_service_name}
%config /etc/sysconfig/logrotate-%{_service_name}-size
%config /etc/logrotate.d/logrotate-%{_service_name}.conf
%config /etc/cron.d/cron-logrotate-%{_service_name}-size
%{_install_dir}

%changelog
* Tue Jun 21 2016 Fermin Galan <fermin.galanmarquez@telefonica.com> 1.0.1
- Fix: modified the permissions of the PID file to be readable by third party SW

* Wed Jun 08 2016 Daniel Moran <daniel.moranjimenez@telefonica.com> 1.0.0
- Fix: serialize actions execution
- Fix: Use current orion db model for no-signal rules (#128)
- Add: Change log level at run-time with PUT (#131)
- Add: Use srv and subsrv in log traces (#132)
- Add: Use 'fiware-correlator' instead of 'unica-correlator' (#133)
- Fix: Bug in update action when origin entity does not have type (#136)
- Fix: Verify checkInterval is valid even if coming from DB (#140)
- Fix: refreshing deleted no-signal rules (regular rules refreshing after deletion was already working) (#141)
- Change: do not lower subservice taken from header (#146)
- Fix: insert service/subservice into core events, taking them from header
- Change: make subject optional for email action
- Add: Take configuration for environment variables for STMP y SMPP Adapter (#153)



* Wed Dec 09 2015 Daniel Moran <daniel.moranjimenez@telefonica.com> 0.7.0
- Modify Perseo's executable to add environment variable-based configuration.
- Add string subsitution for more action parameters (#114)
- Add configuration for secure SMTP servers (#122)

* Thu May 21 2015 Daniel Moran <daniel.moranjimenez@telefonica.com> 0.6.0
- Fix entity's attributes in NSR action (#73)
- Fix #75 (undo #55) Params in updateAction is not an array
- Add auth for update action
- Fix Configuration for no HA (#86)
- Fix Use service/subservice instead of tenant/service (#39)
- Extract params for checkDB to config.js (#6)

* Thu Feb 26 2015 Daniel Moran <daniel.moranjimenez@telefonica.com> 0.5.0
- Fiware-Service validation (#29)
- Fiware-ServicePath validation (#32)
- Change HA model for execution of actions
- Fix error if parameter "type" exist in Update entity action (#30)
- Added 'twitter' action
- Changed 'update' action, any entity
- Do not allow 'id' and 'type' as attribute names
- Change parameter for POST action from 'URL' to 'url'
- Fix error in VR for updateAction (#55)
- Fix validation rule name (#44, #15)
- Fix negative and zero check intervals for NSR (#53)
- Fix missing 'from' in SMS (#67)

* Mon Jan 19 2015 Daniel Moran <daniel.moranjimenez@telefonica.com> 0.4.1
- Fix: using logops as logging library

* Thu Dec 18 2014 Daniel Moran <daniel.moranjimenez@telefonica.com> 0.4.0
- Use EPL context again
- Show number of no-signal rules and checkers clearly in debug logs
- Take service/subservice from original event in actions
- Allow names of attributes to be any string
- Include propagation to next core in the main request, allowing it to fail with only a error log
- Remove service/subservice from examples/
- Simplify names of rules and contexts at core
- Add action card for updateAttribute in VR
- Improve logs for alarm generation
- Add periodical check of databases

* Tue Dec 2 2014 Carlos Romero Brox <brox@tid.es> 0.2.0 
- Add non-signal cards
- Fix header fields not recognized
- Force lowercase for service and servicepath
- Show more characters of data in logs
- Refresh core after DB is setup
- Improve examples
- Add generic POST action
