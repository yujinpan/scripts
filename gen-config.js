#!/usr/bin/env node

const fs = require('fs');

run();

async function run() {
  const directDomains = await exclusionDNSDomains();
  const directIp = await excludedRoutes();

  if (!fs.existsSync('lib')) {
    fs.mkdirSync('lib');
  }
  const file = 'https://raw.githubusercontent.com/yujinpan/scripts/refs/heads/release/qx-excluded-routes.txt';
  const banner = `China Direct Skip Proxy, Last updated: ${new Date().toLocaleString()}\n;By skipping the domain name and IP to bypass VPN, the copying and parsing of direct connection data is eliminated and directly handed over to the system for processing to reduce consumption.\n;Source: ${file}`;
  fs.writeFileSync('lib/qx-excluded-routes.txt', `;${banner}\n${directDomains}\n${directIp}`, {
    encoding: 'utf8',
    flag: 'w',
  });
}

async function excludedRoutes() {
  const localIp = [
    '192.168.0.0/16',
    '172.16.0.0/12',
    '100.64.0.0/10',
    '10.0.0.0/8',
    '239.255.255.250/32',
    '224.0.0.0/24',
  ];

  const url = 'https://raw.githubusercontent.com/Hackl0us/GeoIP2-CN/release/CN-ip-cidr.txt';
  const geoipCN = await fetch(url).then((res) => res.text());

  const allIp = localIp.concat(geoipCN.trim().split('\n'));
  return `;China Direct IP\n;CN-ip-cidr.txt: ${url}\nexcluded_routes = ${allIp.join(
    ', ',
  )}`;
}

async function exclusionDNSDomains() {
  let result = [
    '*.cmpassport.com',
    '*.jegotrip.com.cn',
    '*.icitymobile.mobi',
    'id6.me',
    '*.cn',
  ];

  const url = 'https://raw.githubusercontent.com/sve1r/Rules-For-Quantumult-X/refs/heads/main/Rules/Region/China.list';
  const list = await fetch(url).then((res) => res.text());
  list.split('\n').forEach(item => {
    const [hostType, domain] = item.split(',');
    if (hostType === 'host-suffix') {
      result.push(`*.${domain}`)
    }
  });

  const appleUrl = 'https://raw.githubusercontent.com/felixonmars/dnsmasq-china-list/refs/heads/master/apple.china.conf';
  const googleUrl = 'https://raw.githubusercontent.com/felixonmars/dnsmasq-china-list/refs/heads/master/google.china.conf';
  const appleAndGoogle = [
    '*.itunes.apple.com',
  ].concat(await appleAndGoogleDomainsCN(appleUrl, googleUrl));
  result.push(...appleAndGoogle);

  const dedupRes = [];
  result.forEach(item => {
    let index = dedupRes.findIndex(i => wildcardMatch(i, item));
    if (index !== -1) {
      console.log('remove', item, dedupRes[index]);
      return;
    }
    index = dedupRes.findIndex(i => wildcardMatch(item, i));
    if (index !== -1) {
      console.log('replace', item, dedupRes[index]);
      dedupRes[index] = item;
      return;
    }
    dedupRes.push(item);
  })

  return `;China Direct Domains\n;China.list: ${url}\n;apple.china.conf: ${appleUrl}\n;google.china.conf: ${googleUrl}\ndns_exclusion_list = ${dedupRes.join(', ')}`
}

function wildcardMatch(a, b) {
  if (a === b) return true;
  if (a.startsWith('*.')) {
    return b.endsWith(a.slice(1));
  }
  return false;
}

async function appleAndGoogleDomainsCN(url, url2) {
  const list = await Promise.all(
    [url, url2].map(item => fetch(item).then(res => res.text()))
  ).then((res) => res.join('\n'));
  return list.split('\n').map(item => {
    return item.split('/')[1]
  }).filter(item => !!item);
}