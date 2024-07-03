import {createHmac } from 'crypto';

export function generateSign(apiName, appSecret, params: object) {
    console.log(params);
    // 파라미터를 정렬하고 문자열로 변환합니다.
    const sortedParams = Object.keys(params).sort().map(key => `${key}${params[key]}`).join('');
    const signString = `${apiName}${sortedParams}`;

    // HMAC-SHA256 해시를 생성하고 대문자로 변환합니다.
    const hash = createHmac('sha256',appSecret).update(signString).digest('hex').toUpperCase();
    return hash;
}

