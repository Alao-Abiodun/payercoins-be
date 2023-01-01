const crypto = require('crypto');

module.exports = {
    getRequestDetails,
    randomString
};

function buildChecksum(params, secret, t, r, postData) {
    const p = params || [];
    p.push(`t=${t}`, `r=${r}`);
    if (!!postData) {
      if (typeof postData === 'string') {
        p.push(postData);
      } else {
        p.push(JSON.stringify(postData));
      }
    }
    p.sort();
    p.push(`secret=${secret}`);
    return crypto.createHash('sha256').update(p.join('&')).digest('hex');
}

function randomString(length) {
    let r = '';
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < length; i++)
      r += charset.charAt(Math.floor(Math.random() * charset.length));
     
    return r;
}

function getRequestDetails(api, secret, key, postData, params = [])
{
    const t = Math.floor(Date.now() / 1000);
    const r = randomString(8);

    let url = `${api}?t=${t}&r=${r}`;

    if (params.length > 0) {
      url += `&${params.join('&')}`;
    }

    const options = {
        url,
        headers: {
          'X-API-CODE': key,
          'X-CHECKSUM': buildChecksum(params, secret, t, r, postData)
        },
    };

    return options;
}