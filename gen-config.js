#!/usr/bin/env node

const fs = require('fs');

run();

async function run() {
  const localIp = [
    '192.168.0.0/16',
    '172.16.0.0/12',
    '100.64.0.0/10',
    '10.0.0.0/8',
    '239.255.255.250/32',
    '224.0.0.0/24',
  ];

  const geoipCN = await fetch(
    'https://raw.githubusercontent.com/Hackl0us/GeoIP2-CN/release/CN-ip-cidr.txt',
  ).then((res) => res.text());

  const allIp = localIp.concat(geoipCN.trim().split('\n'));
  const date = new Date();
  const content = `;Excluded CN routes, Last updated: ${date.toLocaleString()}\nexcluded_routes = ${allIp.join(
    ', ',
  )}`;

  if (!fs.existsSync('lib')) {
    fs.mkdirSync('lib');
  }
  fs.writeFileSync('lib/qx-excluded-routes.txt', content, {
    encoding: 'utf8',
    flag: 'w',
  });
}
