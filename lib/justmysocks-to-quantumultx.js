/**
 * scripts 1.0.1-beta.6
 * (c) 2023-2023
 * Rep: https://github.com/yujinpan/scripts
 */

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const {
  $resource,
  $done,
  $notify
} = Function('return this')();
if ($resource) {
  const content = transform($resource.content);
  $done({
    content
  });
  $notify('Complete!', '', content);
}
function transform(content) {
  const data = readBase64(content).split('\n').map(item => {
    const [protocol, infos] = item.split('://');
    try {
      var _ss$vmess$protocol, _ss$vmess;
      return (_ss$vmess$protocol = (_ss$vmess = {
        ss: readShadowsocks,
        vmess: readVmess
      })[protocol]) === null || _ss$vmess$protocol === void 0 ? void 0 : _ss$vmess$protocol.call(_ss$vmess, infos);
    } catch (e) {
      //
    }
  }).filter(item => !!item);
  return data.map(item => Object.entries(item).map(([key, val]) => `${key}=${val}`).join(', ')).join('\n');
}
function readVmess(str) {
  const {
    ps,
    port,
    id,
    add
  } = readJson(readBase64(str));
  return {
    vmess: `${add}:${port}`,
    method: 'aes-128-gcm',
    password: id,
    tag: ps
  };
}
function readShadowsocks(str) {
  const [infoBase64, tag] = str.split('#');
  const info = readBase64(infoBase64);
  const [method, password, ip, port] = info.split(/[:@]/);
  return {
    shadowsocks: `${ip}:${port}`,
    method,
    password,
    tag
  };
}
function readJson(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return json;
  }
}
function readBase64(base64) {
  return new TextDecoder().decode(base64ToBytes(base64));
}
function base64ToBytes(base64) {
  const binString = atob(base64);
  return Uint8Array.from(binString, m => m.codePointAt(0));
}

exports.transform = transform;
