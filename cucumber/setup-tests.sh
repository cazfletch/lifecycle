#!/usr/bin/env bash
#
# SPDX-License-Identifier: Apache-2.0
#
set -ex

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo ${ROOT_DIR}
cd "${ROOT_DIR}"
if [ ! -d tmp ]; then
  mkdir tmp
else
  rm -rf tmp
  mkdir tmp
fi

pushd tmp
curl -sSL http://bit.ly/2ysbOFE | bash -s 2.0.0
pushd fabric-samples/test-network
export FABRIC_DIR="$(pwd)"
./network.sh down
./network.sh up createChannel -ca -s couchdb
popd
popd
