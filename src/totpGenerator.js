let JsSHA = require('jssha');
if (JsSHA.default) {
	// If the default property exist we are probably in webpack
	JsSHA = JsSHA.default;
}

function hex2dec(s) {
	return Number.parseInt(s, 16);
}

function dec2hex(s) {
	return (s < 15.5 ? '0' : '') + Math.round(s).toString(16);
}

function base32tohex(base32) {
	let base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
		bits = '',
		hex = '';

	const b32 = base32.replace(/=+$/, '');

	for (let i = 0; i < b32.length; i++) {
		const val = base32chars.indexOf(b32.charAt(i).toUpperCase());
		if (val === -1) throw new Error('Invalid base32 character in key');
		bits += leftpad(val.toString(2), 5, '0');
	}

	for (let i = 0; i + 8 <= bits.length; i += 8) {
		const chunk = bits.substring(i, i + 8);
		hex = hex + leftpad(Number.parseInt(chunk, 2).toString(16), 2, '0');
	}
	return hex;
}

function leftpad(str, len, pad) {
	let s = str;
	if (len + 1 >= s.length) {
		s = Array(len + 1 - s.length).join(pad) + s;
	}
	return s;
}

function getToken(key, options) {
	const opts = options || {};
	let epoch, time, shaObj, hmac, offset, otp;
	opts.period = opts.period || 30;
	opts.algorithm = opts.algorithm || 'SHA-1';
	opts.digits = opts.digits || 6;
	opts.timestamp = opts.timestamp || Date.now();
	const hexKey = base32tohex(key);
	epoch = Math.floor(opts.timestamp / 1000.0);
	time = leftpad(dec2hex(Math.floor(epoch / opts.period)), 16, '0');
	shaObj = new JsSHA(opts.algorithm, 'HEX');
	shaObj.setHMACKey(hexKey, 'HEX');
	shaObj.update(time);
	hmac = shaObj.getHMAC('HEX');
	offset = hex2dec(hmac.substring(hmac.length - 1));
	otp = (hex2dec(hmac.substr(offset * 2, 8)) & hex2dec('7fffffff')) + '';
	const i = Math.max(otp.length - opts.digits, 0);
	otp = otp.substring(i, i + opts.digits);
	return otp;
}
export default getToken;
