import 'core-js/stable/atob.js';

type Resource = {
  link: string;
  content: string;
};

export function transform(resource: Resource): string {
  const { link, content } = resource;

  const upd = readUdpRelay(link);

  const data: Server[] = readBase64(content)
    .split('\n')
    .map((item) => {
      const [protocol, infos] = item.split('://');

      try {
        const result: Server = {
          ss: readShadowsocks,
          vmess: readVmess,
        }[protocol]?.(infos);

        if (upd) result['udp-relay'] = true;

        return result;
      } catch (e) {
        //
      }
    })
    .filter((item) => !!item);

  return data
    .map((item) =>
      Object.entries(item)
        .filter(([, val]) => !!val)
        .map(([key, val]) => `${key}=${val}`)
        .join(', '),
    )
    .join('\n');
}

type Server = {
  shadowsocks?: string;
  vmess?: string;
  method: string;
  password: string;
  tag: string;
  'udp-relay'?: boolean;
  obfs?: 'over-tls';
};

function readVmess(str: string): Server {
  const { ps, port, id, add, tls } = readJson(readBase64(str));

  return {
    vmess: `${add}:${port}`,
    method: 'aes-128-gcm',
    password: id,
    tag: ps,
    obfs: tls === 'tls' ? 'over-tls' : undefined,
  };
}

function readShadowsocks(str: string): Server {
  const [infoBase64, tag] = str.split('#');
  const info = readBase64(infoBase64);
  const [method, password, ip, port] = info.split(/[:@]/);

  return {
    shadowsocks: `${ip}:${port}`,
    method,
    password,
    tag,
  };
}

// http://test.com?udp = > true
function readUdpRelay(link: string) {
  return link.split('?')[1]?.includes('udp');
}

function readJson(json: string) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return json;
  }
}

function readBase64(base64: string) {
  return atob(base64);
}
