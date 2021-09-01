# zone-handler

zone-handler is a node.js Dynamic DNS update utility. It's working by executing bind-utils package's dig and nsupdate commands. It's required parameter an object with the zone, updateKey, transferKey fields, the keys must be contain name, algorithm, secret fields. In default case it will return a promise which give a handler object which have getRecords,add,update,delete methods for handle the zone by detailed below.
Additionaly if the zone-handler invoke only with a zone field, in that case it will return the authoritative name server belonging to the given zone.


Use cases:

```javascript

import zoneHandler from 'zone-handler';

const zoneData = {
    zone:'example.com',
    updateKey:{
        name:'updatekey',
        algorithm:'hmac-sha256',
        secret:'...secret of the key'
    }
    transferKey:{
        name:'updatekey',
        algorithm:'hmac-sha256',
        secret:'...secret of the key'
    }
}

zoneHandler(zoneData).then(zone => {
    /*
    zone represents the zone, you can handle by calling getRecords,add,update,delete methods.
    */
},err => console.log(err));

```
records is an array of object conatning a hash and a record field. That hash can you use to identify records in case of update and delete. The record field of the objects contain an object wiht name,ttl,type,data fields. 
```javascript

    let records = zone.getRecords(); 

```

Add record by object. (The name field without point at the end will be supplement with zone name!!!)
```javascript

    zone.add({name:'www.example.com.',ttl:3600,type:'A',data:'192.168.0.10'}).then(() => {
        console.log('Record add successfully!');
    },err => {
        console.log('Guru meditation error! :)',err);
    });

```

Add record by string of "dig" like response. (It is work with the update methode as well.)
```javascript

    zone.add("www.example.com.	3600	IN	A	192.168.0.10").then(() => {
        console.log('Record add successfully!');
    },err => {
        console.log('The task faild successfuly! :)',err);
    });

```

hash is identify the zone's teenth record. You can use it for update and delete record.
```javascript

    let hash = records[10].hash;
    // Lets update then.
    zone.update(hash,'www 3600 IN A 192.168.0.10').then(() => {
        console.log('The teenth record updated!');
    },err => console.log('No more joke.',err));

    // delete teenth.
    zone.delete(hash).then(() => {
        console.log('deleted!');
    },err => console.log('yet not'));

```

You can get the the authoritative name server belonging to the given zone by pass with object only  the zone field.
```javascript

let zoneData = { zone:'home.room.example.com' };

zoneHandler(zoneData).then(authoritative => {

    console.log(authorytative); // {zone:'example.com',server:'ns.icann.org'}

},err => console.log('Something very bad thing was in the zone field'));

```

Thanks for reading!
Sorry for my terrible english.