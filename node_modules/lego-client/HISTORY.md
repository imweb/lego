# History

---

## 0.2.11

fix(install) getVersion error, Fix [#31](https://github.com/imweb/lego-client/issues/31)

## 0.2.10

fix(install) check semver match before info

## 0.2.9

- use gnode instead of regenerator
- fix(install) do info first, Fix https://github.com/imweb/lego/issues/1107

## 0.2.8

don't read .gitignore when have .legoignore

## 0.2.7

fix missing gulp when no harmony

## 0.2.6

use vinyl-fs instead of gulp

## 0.2.5

more info in install error

## 0.2.4
- improve print log
- print versions when lego info not specify version

## 0.2.3

- client.config read legorc by default
- fix tar pack using inherits@1.0.0
- add more default ignore files when tar
- use spy for testcase

## 0.2.2

- log tarfile size
- args priority (args > config > global config)

## 0.2.1

- name support array (install)
- check package and lego key (publish)
- base -> cwd (install)
- resolve cwd (install and publish)

## 0.2.0

support harmony generator

## 0.1.0

First version
