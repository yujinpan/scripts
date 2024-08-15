import { transform } from './justmysocks-to-quantumultx';

describe('transform', () => {
  it('should transform justmysocks to quantumultx', function () {
    const test =
      'c3M6Ly9ZV1Z6TFRJMU5pMW5ZMjA2TVRJek5EVTJRREV1TVM0eExqRTZNVEV4TVE9PSN0ZXN0CnZtZXNzOi8vZXlKd2N5STZJblJsYzNRaUxDSndiM0owSWpvaU1URXhNU0lzSW1sa0lqb2lNVEl6TkRVMklpd2lZV2xrSWpvd0xDSnVaWFFpT2lKMFkzQWlMQ0owZVhCbElqb2libTl1WlNJc0luUnNjeUk2SW01dmJtVWlMQ0poWkdRaU9pSXhMakV1TVM0eEluMD0=';
    expect(transform({ link: '', content: test }))
      .toBe(`shadowsocks=1.1.1.1:1111, method=aes-256-gcm, password=123456, tag=test
vmess=1.1.1.1:1111, method=chacha20-poly1305, password=123456, tag=test`);
    expect(transform({ link: 'https://test.com?udp', content: test }))
      .toBe(`shadowsocks=1.1.1.1:1111, method=aes-256-gcm, password=123456, tag=test, udp-relay=true
vmess=1.1.1.1:1111, method=chacha20-poly1305, password=123456, tag=test, udp-relay=true`);

    const testTls =
      'c3M6Ly9ZV1Z6TFRJMU5pMW5ZMjA2TVRJek5EVTJRREV1TVM0eExqRTZNVEV4TVE9PSN0ZXN0CnZtZXNzOi8vZXlKd2N5STZJblJsYzNRaUxDSndiM0owSWpvaU1URXhNU0lzSW1sa0lqb2lNVEl6TkRVMklpd2lZV2xrSWpvd0xDSnVaWFFpT2lKMFkzQWlMQ0owZVhCbElqb2libTl1WlNJc0luUnNjeUk2SW5Sc2N5SXNJbUZrWkNJNklqRXVNUzR4TGpFaWZRPT0=';
    expect(transform({ link: 'https://test.com?udp', content: testTls }))
      .toBe(`shadowsocks=1.1.1.1:1111, method=aes-256-gcm, password=123456, tag=test, udp-relay=true
vmess=1.1.1.1:1111, method=chacha20-poly1305, password=123456, tag=test, obfs=over-tls, udp-relay=true`);
    expect(transform({ link: 'https://test.com?aes', content: testTls }))
      .toBe(`shadowsocks=1.1.1.1:1111, method=aes-256-gcm, password=123456, tag=test
vmess=1.1.1.1:1111, method=aes-128-gcm, password=123456, tag=test, obfs=over-tls`);
  });
});
