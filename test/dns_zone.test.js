import child_process from 'child_process';
import dns_zone from '../src/dns_zone';
import nsupdate from '../src/util/nsupdate';
import { TranslatableError } from '../lib/translatableError';

jest.mock('child_process');

jest.mock('../src/util/nsupdate',() => {
    return {
        __esModule: true,
        default:jest.fn(() => {
            return new Promise(resolve => resolve());
        })
    }
});

const digResponse = '; <<>> DiG 9.11.5-P4-5.1+deb10u5-Raspbian <<>> @ns0.hobbyfork.com hobbyfork.com axfr -k tsig.key\n'+
'; (1 server found)\n'+
';; global options: +cmd\n'+
'hobbyfork.com.		21600	IN	SOA	ns0.hobbyfork.com. hostmaster.hobbyfork.com. 2021081502 43200 7200 2419200 600\n'+
'hobbyfork.com.		604800	IN	NS	ns0.hobbyfork.com.\n'+
'hobbyfork.com.		604800	IN	NS	ns1.hobbyfork.com.\n'+
'hobbyfork.com.		604800	IN	A	92.111.27.14\n'+
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

const request = {
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
}

const errorRequest = {
    zone:'hobbyfork.com',
    server:'ns0.hobbyfork.com',
    updateKey:false,
    transferKey:{
        name:'tsig',
        algorithm:'hmac-sha256',
        secret:'a765hs6h7sdh75g765'
    }
}

describe('dns_zone', () => {

    test('dns_zone default use case.',done => {
        expect.assertions(6);
        dns_zone(request).then(zone => {
            expect(zone.getRecords().length).toBe(12);
            expect(zone.getRecords()).toMatchSnapshot();
            zone.add('home.hobbyfork.com. 21600 IN A 192.168.1.6').then(() => {
                zone.update('2a35bcda975bb00eaf1a26278314d905','www.hobbyfork.com. 21600 IN A 34.123.39.11').then(() => {
                    zone.delete('2a35bcda975bb00eaf1a26278314d905').then(() => {
                        expect(nsupdate.mock.calls.length).toBe(3);
                        expect(nsupdate.mock.calls[0][0]).toMatchSnapshot();
                        expect(nsupdate.mock.calls[1][0]).toMatchSnapshot();
                        expect(nsupdate.mock.calls[2][0]).toMatchSnapshot();
                        done();
                    });
                });
            });
        },err => {
            expect(err).toBe('error');
            done();
        });
        child_process._current.stdout.push(digResponse);
        process.nextTick(() => child_process._current.emit('close',0));
    });

    test('dns_zone missing updateKey',done => {
        expect.assertions(1);
        dns_zone( {zone:'hobbyfork.com',
        server:'ns0.hobbyfork.com',
        updateKey:false,
        transferKey:{
            name:'tsig',
            algorithm:'hmac-sha256',
            secret:'a765hs6h7sdh75g765'
        }}).then(zone => {
            zone.add('home.hobbyfork.com. 21600 IN A 192.168.1.6').catch(err => {
                expect(err).toBeInstanceOf(TranslatableError);
                done();
            });
        },err => {
            expect(err).toBe('error');
            done();
        });
        child_process._current.stdout.push(digResponse);
        process.nextTick(() => child_process._current.emit('close',0));
    });

    test('dns_zone add/update/delete errors',done => {
        expect.assertions(4);
        dns_zone(request).then(zone => {
            zone.add('hobbyfork.com.		604800	IN	NS	ns1.hobbyfork.com.').catch(err => {
                expect(err).toBeInstanceOf(TranslatableError);
                zone.update('2a35bcda975bb00eaf1a26278314d905','hobbyfork.com.		604800	IN	NS	ns1.hobbyfork.com.').catch(err2 => {
                    expect(err2).toBeInstanceOf(TranslatableError);
                    zone.update('2a35bcda975bb00eaf1a26278314d90','home.hobbyfork.com. 21600 IN A 192.168.1.6').catch(err3 => {
                        expect(err3).toBeInstanceOf(TranslatableError);
                        zone.delete('2a35bcda975bb00eaf1a26278314d90').catch(err3 => {
                            expect(err3).toBeInstanceOf(TranslatableError);
                            done()
                        });
                    });
                });
            });
        },err => {
            expect(err).toBe('error');
            done();
        });
        child_process._current.stdout.push(digResponse);
        process.nextTick(() => child_process._current.emit('close',0));
    });


});



