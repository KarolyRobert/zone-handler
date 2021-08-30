import child_process from 'child_process';
import dns_zone from '../src/dns_zone';

jest.mock('child_process');

const digResponse = '; <<>> DiG 9.11.5-P4-5.1+deb10u5-Raspbian <<>> @ns0.hobbyfork.com hobbyfork.com axfr -k tsig.key\n'+
'; (1 server found)\n'+
';; global options: +cmd\n'+
'hobbyfork.com.		21600	IN	SOA	ns0.hobbyfork.com. hostmaster.hobbyfork.com. 2021081502 43200 7200 2419200 600\n'+
'hobbyfork.com.		604800	IN	NS	ns0.hobbyfork.com.\n'+
'hobbyfork.com.		604800	IN	NS	ns1.hobbyfork.com.\n'+
'hobbyfork.com.		604800	IN	A	92.118.27.14\n'+
'hobbyfork.com.		604800	IN	RRSIG	A 13 2 604800 20210823025040 20210809170317 22370 hobbyfork.com. rrMcsVrp2rIzmrz7EgTNa2vsJyZjdDLPOaMjbufQIt6V+A 7GSEtB0SuW92GZGg==\n'+
'hobbyfork.com.		604800	IN	MX	10 mail.hobbyfork.com.\n'+
'hobbyfork.com.		86400	IN	TXT	"v=spf1 mx ~all"\n'+
'hobbyfork.com.		604800	IN	DNSKEY	257 3 13 xDMv4a6Cfgk0al1GfePls+fslmVfsFQdRegZSAvyj4js6Y8URqpjPfMCk 1Qy2UNW/5PLwN3pJORaXxpUpN4uCBQ==\n'+
'hobbyfork.com.		0	IN	NSEC3PARAM 1 0 10 30359FDCFA1D73EF\n'+
'hobbyfork.com.		3600	IN	CDS	22370 13 2 C74396E179A86BC6E3ACA45E283A168DA5E7707083632F88B6AE2548 3C47E30C\n'+
'hobbyfork.com.		3600	IN	CDNSKEY	257 3 13 xDMv4a6Cfgk0al1GfePl+fslmVfsFQdRegZ6Y8URqpjPfMCk 1Qy2UNW/5PLwN3pxpUpN4uCBQ==\n'+
'hobbyfork.com.		0	IN	TYPE65534 \# 5 0D57620001\n'+
'_dmarc.hobbyfork.com.	86400	IN	TXT	"v=DMARC1; p=reject; pct=100; fo=1; rua=mailto:postmaster@hobbyfork.com"\n'+
'default._domainkey.hobbyfork.com. 86400	IN TXT	"v=DKIM1; h=sha256; k=rsa; " "p=MIIBIjggdANBgdkLqmTMaE89iRTpZd8pyHvsBWC9UTKPMyGYg//ZeW7KEHhQuQkSvKO3HsFN2pzeQI+UGszHviykKXz3SxReHSscolEEmxnckc8mtK78DO3KFbg6lp" "aqUNjhhOnVEvsYpwC6FIw09ZpfWghemQ9JDPI+xVpapuVvzvUbwIDAQAB"\n'+
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


describe('dns_zone', () => {

    test('dns_zone promise an object with getRecords, and command properties.',done => {
        expect.assertions(5);
        dns_zone({
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
        }).then(zone => {
            let hases = zone.getRecords().map(record => record.hash);
            expect(zone.getRecords().length).toBe(12);
            expect(hases).toEqual([
                "9aa25f49e7c4e9d05f30862818f57717",
                "6f3a8a9d844888acc7cd3bb3e88c5767",
                "8b946252701c4b2d3fc3d1b9cc1a7d8b",
                "e0832e4c3c82cd6b9a4a01f7a509e62a",
                "75e21d6ec44bf09aba586b0faafa7601",
                "fcad8a0f3a6a84f80b1653de77ea2e0b",
                "7bff7fabba00a16fa3cb500592c11095",
                "b81fe34e0b805d0b13f449173b03b746",
                "81a4c948c1b2e6dbfe0d0e72012a15ca",
                "1357d488cbc526fe2f351b94b4c8b382",
                "a453d4c826191769b371e3f18efb172f",
                "2a35bcda975bb00eaf1a26278314d905",
            ]);
            expect(zone.command('add',null,'home.hobbyfork.com. 21600 IN A 192.168.1.6')).toBe(
                'zone hobbyfork.com\n'+
                'key hmac-sha256:update.key asdfksf8s6s875g765\n'+
                'update add home.hobbyfork.com. 21600 A 192.168.1.6\n'+
                'send\n');
            expect(zone.command('update','2a35bcda975bb00eaf1a26278314d905','home.hobbyfork.com. 21600 IN A 192.168.1.6')).toBe(
                'zone hobbyfork.com\n'+
                'key hmac-sha256:update.key asdfksf8s6s875g765\n'+
                'update delete www.hobbyfork.com. 30 A 37.234.91.82\n'+
                'update add home.hobbyfork.com. 21600 A 192.168.1.6\n'+
                'send\n');
            expect(zone.command('delete','2a35bcda975bb00eaf1a26278314d905')).toBe(
                'zone hobbyfork.com\n'+
                'key hmac-sha256:update.key asdfksf8s6s875g765\n'+
                'update delete www.hobbyfork.com. 30 A 37.234.91.82\n'+
                'send\n');
            done();
        },err => {
            expect(err).toBe('error');
            done();
        });
        child_process._current.stdout.push(digResponse);
        process.nextTick(() => child_process._current.emit('close',0));
    });

});



