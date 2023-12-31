import 'core-js/stable/atob.js';

export function transform(content: string): string {
  const data: Server[] = readBase64(content)
    .split('\n')
    .map((item) => {
      const [protocol, infos] = item.split('://');

      try {
        return {
          ss: readShadowsocks,
          vmess: readVmess,
        }[protocol]?.(infos);
      } catch (e) {
        //
      }
    })
    .filter((item) => !!item);

  return data
    .map((item) =>
      Object.entries(item)
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
};

function readVmess(str: string): Server {
  const { ps, port, id, add } = readJson(readBase64(str));

  return {
    vmess: `${add}:${port}`,
    method: 'aes-128-gcm',
    password: id,
    tag: ps,
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
