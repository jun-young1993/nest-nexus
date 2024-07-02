const crypto = require('crypto');

export function generateSign(appSecret, params) {
    // 파라미터를 정렬하고 문자열로 변환합니다.
    const sortedParams = Object.keys(params).sort().map(key => `${key}${params[key]}`).join('');
    const signString = `${appSecret}${sortedParams}${appSecret}`;

    // HMAC-SHA256 해시를 생성하고 대문자로 변환합니다.
    const hash = crypto.createHash('sha256').update(signString).digest('hex').toUpperCase();
    return hash;
}

