# History

---

## 0.2.11

fix(utils) recgnize `module['exports']`, Fix [spmjs/spm#1180](https://github.com/spmjs/spm/issues/1180)

## 0.2.10

fix(commonjs) convert hasModule declaration to true

## 0.2.9

add `is exports` situation: export['default'], property can be Literal

## 0.2.8

* fix hidden dead loop problem

## 0.2.7

* support rename for ignore modules

## 0.2.6

* fix exports default value problem

## 0.2.5

* add `exports = {}` for code with exports assignment
* add exports param for code with exports in function params

## 0.2.4

* add commonjs condition

## 0.2.3

* update umd wrap, support cmd loader

## 0.2.2

* Fix exports assignment, like `var Cookie = exports = {};`

## 0.2.1

* Support `exports` assignment
* Don't pass exports if func has no `exports` or `module.exports` assignment

## 0.2.0

* Add umd support

## 0.1.0

* Initial commit
