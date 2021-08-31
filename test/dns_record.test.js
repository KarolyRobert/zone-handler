import dns_record  from '../src/dns_record';




describe("dns_record",() => {

    let raw = {name:'www',ttl:6300,type:'A',data:'127.0.0.1'}
    let record = dns_record(raw,'example.com');
    
    test("dns_record can be able construct from object and need to have a hash to identify", () => {
        expect(record.hash).toBe('f5fe0849349193f6e0e208cbd36d2013');
    });

    test("dns_record can be able to construct from dig response line of dns record and with same fields need to identify with same hash", () => {
        raw = 'www.example.com.     6300    IN  A   127.0.0.1';
        record = dns_record(raw,'example.com');
        expect(record.hash).toBe('f5fe0849349193f6e0e208cbd36d2013');
        expect(record.add_command()).toBe('update add www.example.com. 6300 A 127.0.0.1\n');
    });

    test("dns_record form dig response TXT type line nedd to convert proper format inside", () => {
        raw = 'example.com.		86400	IN	TXT	"v=spf1 mx ~all"'
        record = dns_record(raw,'example.com');
        expect(record.add_command()).toBe('update add example.com. 86400 TXT "v=spf1 mx ~all"\n');

        raw = 'default._domainkey.example.com. 86400	IN TXT	"v=DKIM1; h=sha256; k=rsa; " "p=MIIBIjANBgdkLqmTMaE89iRTpZd8pyHvsBWC9UTKPMyGYg//ZeW7KEHhQuQkSvKO3HsFMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA43QaeE+2BNynULGSGJZBSN2pzeQI+UGszHviykKXz3SxReHSscolEEmxnckc8mtK78DOYf8Taq4uD3QfO76ZG40Jc6nvhYSd3a/r1O3KFbg6lp" "aqUNjhhOnVEvsYpwCMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA43QaeE+2BNynULGSGJZBS6FIw09ZpfWghemQ9JDPI+xVpa19i39KP30IxWUyYUVd0BYSpuVvzvUbwIDAQAB"'
        record = dns_record(raw,'example.com');
        expect(record.add_command()).toBe('update add default._domainkey.example.com. 86400 TXT "v=DKIM1; h=sha256; k=rsa; p=MIIBIjANBgdkLqmTMaE89iRTpZd8pyHvsBWC9UTKPMyGYg//ZeW7KEHhQuQkSvKO3HsFMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA43QaeE+2BNynULGSGJZBSN2pzeQI+UGszHviykKXz3SxReHSscolEEmxnckc8mtK78DOYf8Taq4uD3QfO76ZG40Jc6nvhYSd3a/r1O3KFbg6lpaqUN" "jhhOnVEvsYpwCMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA43QaeE+2BNynULGSGJZBS6FIw09ZpfWghemQ9JDPI+xVpa19i39KP30IxWUyYUVd0BYSpuVvzvUbwIDAQAB"\n');
    });

    test("dns_record nedd to have add update delete method and a hash field", () => {
        raw = {name:'www',ttl:6300,type:'A',data:'127.0.0.1'};
        record = dns_record(raw,'example.com');
        expect(record).toHaveProperty('add_command','delete_command','update_command','hash');
    });

    test("Creation of dns_record with invalid name field must throw error.",() => {
        raw = { name:'-www',ttl:6300,type:'A',data:'127.0.0.1' }
        expect(() => dns_record(raw,'example.com')).toThrow('The name "-www" is invalid!');

        raw = { name:'www-',ttl:6300,type:'A',data:'127.0.0.1' }
        expect(() => dns_record(raw,'example.com')).toThrow('The name "www-" is invalid!');

        raw = { name:'www-.example.com.',ttl:6300,type:'A',data:'127.0.0.1' }
        expect(() => dns_record(raw,'example.com')).toThrow('The name "www-.example.com." is invalid or outside of zone!');

        raw = { name:'-www.example.com.',ttl:6300,type:'A',data:'127.0.0.1' }
        expect(() => dns_record(raw,'example.com')).toThrow('The name "-www.example.com." is invalid or outside of zone!');

        raw = { name:'www.exampl.com.',ttl:6300,type:'A',data:'127.0.0.1' }
        expect(() => dns_record(raw,'example.com')).toThrow('The name "www.exampl.com." is invalid or outside of zone!');

        raw = { name:'www.exőampl',ttl:6300,type:'A',data:'127.0.0.1' }
        expect(() => dns_record(raw,'example.com')).toThrow('The name "www.exőampl" is invalid!');

        raw = { name:'w w.example.com.',ttl:6300,type:'A',data:'127.0.0.1' }
        expect(() => dns_record(raw,'example.com')).toThrow('The name "w w.example.com." is invalid or outside of zone!');
    });

    describe("dns_record.add need to return a proper command to add record with nsupdate.",() => {

      
        test("Simple case of dns_record.add", () => {
        
            expect(record.add_command()).toBe('update add www.example.com. 6300 A 127.0.0.1\n');

            raw = {name:'_www',ttl:6300,type:'A',data:'127.0.0.1'}
            record = dns_record(raw,'example.com');
            expect(record.add_command()).toBe('update add _www.example.com. 6300 A 127.0.0.1\n');

            raw = {name:'www_',ttl:6300,type:'A',data:'127.0.0.1'}
            record = dns_record(raw,'example.com');
            expect(record.add_command()).toBe('update add www_.example.com. 6300 A 127.0.0.1\n');

            raw = {name:'_www.example.com.',ttl:6300,type:'A',data:'127.0.0.1'}
            record = dns_record(raw,'example.com');
            expect(record.add_command()).toBe('update add _www.example.com. 6300 A 127.0.0.1\n');

            raw = { name:'www.example.com.',ttl:6300,type:'A',data:'127.0.0.1' }
            record = dns_record(raw,'example.com');
            expect(record.add_command()).toBe('update add www.example.com. 6300 A 127.0.0.1\n');

            raw = { name:'_www.example.com.',ttl:6300,type:'A',data:'127.0.0.1' }
            record = dns_record(raw,'example.com');
            expect(record.add_command()).toBe('update add _www.example.com. 6300 A 127.0.0.1\n');

            raw = { name:'www_.example.com.',ttl:6300,type:'A',data:'127.0.0.1' }
            record = dns_record(raw,'example.com');
            expect(record.add_command()).toBe('update add www_.example.com. 6300 A 127.0.0.1\n');

            raw = { name:'w-ww.example.com.',ttl:6300,type:'A',data:'127.0.0.1' }
            record = dns_record(raw,'example.com');
            expect(record.add_command()).toBe('update add w-ww.example.com. 6300 A 127.0.0.1\n');

            raw = {name:'w-ww',ttl:6300,type:'A',data:'127.0.0.1'}
            record = dns_record(raw,'example.com');
            expect(record.add_command()).toBe('update add w-ww.example.com. 6300 A 127.0.0.1\n');
            
        });

        // valid sintax of TXT record.
        test("dns_record.add need to convert the short and long data field of record which have TXT type.", () => {

            raw = { name:'www',ttl:6300,type:'TXT',data:'v=spf1 mx ~all'}
            record = dns_record(raw,'example.com');
            expect(record.add_command()).toBe("update add www.example.com. 6300 TXT \"v=spf1 mx ~all\"\n");

            raw = { name:'_default.domainkey',ttl:6300,type:'TXT',data:'v=DKIM1; h=sha256; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA43QaeE+2BNynULGSGJZBSFJUCpoJMy9zVvx1pDGvychXuB+K6ZAsmZbF4ardkLqmTMaE89iRTpZd8pyHvsBWC9UTKPMyGYg//ZeW7KEHhQuQkSvKO3HsFN2pzeQI+UGszHviykKXz3SxReHSscolEEmxnckc8mtK78DOYf8Taq4uD3QfO76ZG40Jc6nvhYSd3a/r1O3KFbg6lpaqUNjLxTdPgOyvtQ8KwYCAw9LUNVUeBiK99UkRclbJHBhhOnVEvsYpwC6FIw09ZaiHcSuBgds/fAcI9r8D/JgqApfWghemQ9JDPI+xVpa19i39KP30IxWUyYUVd0BYSpuVvzvUbwIDAQAB'}
            record = dns_record(raw,'example.com');
            expect(record.add_command()).toBe("update add _default.domainkey.example.com. 6300 TXT \"v=DKIM1; h=sha256; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA43QaeE+2BNynULGSGJZBSFJUCpoJMy9zVvx1pDGvychXuB+K6ZAsmZbF4ardkLqmTMaE89iRTpZd8pyHvsBWC9UTKPMyGYg//ZeW7KEHhQuQkSvKO3HsFN2pzeQI+UGszHviykKXz3SxReHSscolEEmxnckc8mtK78DOYf8Taq4uD3QfO76ZG4\" \"0Jc6nvhYSd3a/r1O3KFbg6lpaqUNjLxTdPgOyvtQ8KwYCAw9LUNVUeBiK99UkRclbJHBhhOnVEvsYpwC6FIw09ZaiHcSuBgds/fAcI9r8D/JgqApfWghemQ9JDPI+xVpa19i39KP30IxWUyYUVd0BYSpuVvzvUbwIDAQAB\"\n");
        });


    });

    describe("dns_record.delete need to return a proper command to delete record with nsupdate.",() => {

        test("simple case of delete.", () => {
            let raw = {name:'www',ttl:6300,type:'A',data:'127.0.0.1'}
            let record = dns_record(raw,'example.com');

            expect(record.delete_command()).toBe('update delete www.example.com. 6300 A 127.0.0.1\n');
        });
    });

    describe("dns_record.update need to return lines of proper command to delete and add record with nsupdate except the case of SOA type record when need to return only a proper command to add the updated SOA record.",() => {

        let raw = {name:'www',ttl:6300,type:'A',data:'127.0.0.1'}
        let update_raw = {name:'update',ttl:3200,type:'CNAME',data:'www.example.com.'}
        let record = dns_record(raw,'example.com');
        test("simple case of update.",() => {
            expect(record.update_command(dns_record(update_raw,'example.com'))).toBe('update delete www.example.com. 6300 A 127.0.0.1\nupdate add update.example.com. 3200 CNAME www.example.com.\n');
        });

        test("case of SOA reecord.", () => {
            raw = {name:'example.com.',ttl:21600,type:'SOA',data:'ns1.example.com. postmaster.example.com. 2015081501 43200 7200 2419200 600'};
            update_raw = {name:'example.com.',ttl:21600,type:'SOA',data:'ns1.example.com. hostmaster.example.com. 2015081501 43200 7200 2419200 600'};
            record = dns_record(raw,'example.com');
            expect(record.update_command(dns_record(update_raw,'example.com'))).toBe('update add example.com. 21600 SOA ns1.example.com. hostmaster.example.com. 2015081501 43200 7200 2419200 600\n');
        });
    });


});