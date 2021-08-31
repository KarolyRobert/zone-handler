import child_process from 'child_process';
import { transferZone, getAuthoritative } from '../src/util/utils';


jest.mock('child_process');


const digaxfr = '; <<>> DiG 9.11.5-P4-5.1+deb10u5-Raspbian <<>> @ns0.hobbyfork.com hobbyfork.com axfr -k tsig.key\n'+
'; (1 server found)\n'+
';; global options: +cmd\n'+
'hobbyfork.com.		21600	IN	SOA	ns0.hobbyfork.com. hostmaster.hobbyfork.com. 2021081502 43200 7200 2419200 600\n'+
'hobbyfork.com.		604800	IN	NS	ns0.hobbyfork.com.\n'+
'hobbyfork.com.		604800	IN	NS	ns1.hobbyfork.com.\n'+
'hobbyfork.com.		604800	IN	A	92.118.27.14\n'+
'hobbyfork.com.		604800	IN	RRSIG	A 13 2 604800 20210823025040 20210809170317 22370 hobbyfork.com. rrMcsVrp2rIzmrz7EgTNa2vsJyZjdDLPOaMjbufQIt6V+A 7GSEtB0SuW92GZGg==\n'+
'hobbyfork.com.		604800	IN	MX	10 mail.hobbyfork.com.\n'+
'hobbyfork.com.		86400	IN	TXT	"v=spf1 mx ~all"\n'+
'hobbyfork.com.		604800	IN	DNSKEY	257 3 13 xDMv4a6Cfgk0al1GfePl+fslmVfsFQdRegZSAvyj4js6Y8URqpjPfMCk 1Qy2UNW/5PLwN3pJORaXxpUpN4uCBQ==\n'+
'hobbyfork.com.		0	IN	NSEC3PARAM 1 0 10 30359FDCFA1D73EF\n'+
'hobbyfork.com.		3600	IN	CDS	22370 13 2 C74396E179A86BC6E3ACA45E283A168DA5E7707083632F88B6AE2548 3C47E30C\n'+
'hobbyfork.com.		3600	IN	CDNSKEY	257 3 13 xDMv4a6Cfgk0al1GfePl+fslmVfsFQdRegZ6Y8URqpjPfMCk 1Qy2UNW/5PLwN3pxpUpN4uCBQ==\n'+
'hobbyfork.com.		0	IN	TYPE65534 \# 5 0D57620001\n'+
'_dmarc.hobbyfork.com.	86400	IN	TXT	"v=DMARC1; p=reject; pct=100; fo=1; rua=mailto:postmaster@hobbyfork.com"\n'+
'default._domainkey.hobbyfork.com. 86400	IN TXT	"v=DKIM1; h=sha256; k=rsa; " "p=MIIBIjANBgdkLqmTMaE89iRTpZd8pyHvsBWC9UTKPMyGYg//ZeW7KEHhQuQkSvKO3HsFN2pzeQI+UGszHviykKXz3SxReHSscolEEmxnckc8mtK78DO3KFbg6lp" "aqUNjhhOnVEvsYpwC6FIw09ZpfWghemQ9JDPI+xVpapuVvzvUbwIDAQAB"\n'+
'mail.hobbyfork.com.	604800	IN	A	92.118.27.14\n'+
'ns0.hobbyfork.com.	604800	IN	A	45.148.28.74\n'+
'ns1.hobbyfork.com.	604800	IN	A	92.118.27.14\n'+
'www.hobbyfork.com.	30	IN	A	37.234.91.82\n'+
'2NHI2QRRGJ21UFACQGRECNRF7P6EF7S2.hobbyfork.com.	600 IN NSEC3 1 1 10 30359FDCFA1D73EF 3OG57RMC11QJC4SH0SEN6RHEB30EPMOH CNAME RRSIG\n'+
'hobbyfork.com.		21600	IN	SOA	ns0.hobbyfork.com. hostmaster.hobbyfork.com. 2021081502 43200 7200 2419200 600\n'+
'tsig.			0	ANY	TSIG	hmac-sha256. 1629138967 300 32 0snJBxPUhMsKUZ9Bp+HCyTldosvSvhNO+HEsgASSQS0M= 55494 NOERROR 0 \n'+
';; Query time: 80 msec\n'+
';; SERVER: 45.148.28.74#53(45.148.28.74)\n'+
';; WHEN: h aug 16 20:36:07 CEST 2021\n'+
';; XFR size: 66 records (messages 1, bytes 5844)\n';

const digSOA = '; <<>> DiG 9.11.5-P4-5.1+deb10u5-Raspbian <<>> teva.fasz.hobbyfork.com\n'+
';; global options: +cmd\n'+
';; Got answer:\n'+
';; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 59648\n'+
';; flags: qr rd ra; QUERY: 1, ANSWER: 0, AUTHORITY: 1, ADDITIONAL: 1\n'+
'\n'+
';; OPT PSEUDOSECTION:\n'+
'; EDNS: version: 0, flags:; udp: 512\n'+
';; QUESTION SECTION:\n'+
';teva.fasz.hobbyfork.com.	IN	A\n'+
'\n'+
';; AUTHORITY SECTION:\n'+
'hobbyfork.com.		600	IN	SOA	ns0.hobbyfork.com. hostmaster.hobbyfork.com. 2021081533 43200 7200 2419200 600\n'+
'\n'+
';; Query time: 104 msec\n'+
';; SERVER: 8.8.4.4#53(8.8.4.4)\n'+
';; WHEN: k aug 31 05:03:51 CEST 2021\n'+
';; MSG SIZE  rcvd: 103\n'



describe('util',() => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('transferZone',() => {
        test('transferZone call dig axfr and transfer editable records by addRecordToZone callback.', done => {
            expect.assertions(4);
            let add = jest.fn();
            transferZone({
                zone:'hobbyfork.com',
                server:'ns0.hobbyfork.com',
                updateKey:{
                    name:'update.key',
                    algorithm:'hmac-sha256',
                    secret:'asdfksf8s6s875g765'
                },
                transferKey:{
                    name:'tsig',
                    algorithm:'hmac-sha256',
                    secret:'a765hs6h7sdh75g765'
                }
            },add).then(() => {
                expect(add.mock.calls.length).toBe(13);
                expect(child_process.spawn.mock.calls.length).toBe(1);
                expect(child_process.spawn.mock.calls[0][0]).toBe('dig');
                expect(child_process.spawn.mock.calls[0][1]).toEqual([
                    "@ns0.hobbyfork.com",
                    "hobbyfork.com",
                    "axfr",
                    "-y",
                    "hmac-sha256:tsig:a765hs6h7sdh75g765"
                ]);
                done();
            });
            child_process._current.stdout.push(digaxfr);
            process.nextTick(() => child_process._current.emit('close',0));
        });

    });
    describe('getAuthoritation',() => {
        expect.assertions(4);
        test('getAuthoritative return the authoritative name server belonging to the given zone by domain name.',done => {
            getAuthoritative('domain.above.hobbyfork.com').then(result => {
                expect(result).toStrictEqual({zone:'hobbyfork.com',server:'ns0.hobbyfork.com'});
                expect(child_process.spawn.mock.calls.length).toBe(1);
                expect(child_process.spawn.mock.calls[0][0]).toBe('dig');
                expect(child_process.spawn.mock.calls[0][1]).toEqual(['domain.above.hobbyfork.com']);
                done();
            });
            child_process._current.stdout.push(digSOA);
            process.nextTick(() => child_process._current.emit('close',0));
        });
      
    });
});