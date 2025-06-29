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
  const description = 'By skipping the domain name and IP to bypass VPN, the copying and parsing of direct connection data is eliminated and directly handed over to the system for processing to reduce consumption.';
  const banner = `China Direct Skip Proxy, Last updated: ${new Date().toLocaleString()}\n;${description}\n;Source: ${file}`;
  const content = `;${banner}\n${directDomains}\n${directIp}`;
  fs.writeFileSync('lib/qx-excluded-routes.txt', content, {
    encoding: 'utf8',
    flag: 'w',
  });

  const sampleConf = fs.readFileSync('./config/quantumultx-sample.conf').toString();
  fs.writeFileSync('lib/quantumultx-sample.conf', sampleConf.replace('\n[dns]', `${content}\n\n[dns]`), {
    encoding: 'utf8',
    flag: 'w',
  })
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
  let result = readDomainFromServers(fs.readFileSync('./config/whitelist.txt').toString());

  const url = 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/QuantumultX/China/China.list';
  const list = await fetch(url).then((res) => res.text());
  list.split('\n').forEach(item => {
    const [hostType, domain] = item.split(',');
    switch (hostType) {
    case 'HOST':
    case 'HOST-KEYWORD':
    case 'HOST-WILDCARD':
      result.push(domain)
      break;
    case 'HOST-SUFFIX':
      result.push(`*.${domain}`)
      break;
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
  return readDomainFromServers(list);
}

function readDomainFromServers(servers) {
  return servers.split('\n').map(item => {
    return item.split('/')[1]
  }).filter(item => !!item);
}