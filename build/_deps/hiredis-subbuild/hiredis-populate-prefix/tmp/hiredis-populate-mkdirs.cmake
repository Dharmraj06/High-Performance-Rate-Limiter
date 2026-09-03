# Distributed under the OSI-approved BSD 3-Clause License.  See accompanying
# file Copyright.txt or https://cmake.org/licensing for details.

cmake_minimum_required(VERSION 3.5)

file(MAKE_DIRECTORY
  "/home/dharmraj/projects/rate-limiter/build/_deps/hiredis-src"
  "/home/dharmraj/projects/rate-limiter/build/_deps/hiredis-build"
  "/home/dharmraj/projects/rate-limiter/build/_deps/hiredis-subbuild/hiredis-populate-prefix"
  "/home/dharmraj/projects/rate-limiter/build/_deps/hiredis-subbuild/hiredis-populate-prefix/tmp"
  "/home/dharmraj/projects/rate-limiter/build/_deps/hiredis-subbuild/hiredis-populate-prefix/src/hiredis-populate-stamp"
  "/home/dharmraj/projects/rate-limiter/build/_deps/hiredis-subbuild/hiredis-populate-prefix/src"
  "/home/dharmraj/projects/rate-limiter/build/_deps/hiredis-subbuild/hiredis-populate-prefix/src/hiredis-populate-stamp"
)

set(configSubDirs )
foreach(subDir IN LISTS configSubDirs)
    file(MAKE_DIRECTORY "/home/dharmraj/projects/rate-limiter/build/_deps/hiredis-subbuild/hiredis-populate-prefix/src/hiredis-populate-stamp/${subDir}")
endforeach()
if(cfgdir)
  file(MAKE_DIRECTORY "/home/dharmraj/projects/rate-limiter/build/_deps/hiredis-subbuild/hiredis-populate-prefix/src/hiredis-populate-stamp${cfgdir}") # cfgdir has leading slash
endif()
