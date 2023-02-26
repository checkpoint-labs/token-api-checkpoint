import { getAddress } from '@ethersproject/address';
import { BigNumber } from '@ethersproject/bignumber';
import { SplitUint256 } from '@snapshot-labs/sx/dist/utils/split-uint256';

export const toAddress = bn => {
  try {
    return getAddress(BigNumber.from(bn).toHexString());
  } catch (e) {
    return bn;
  }
};

export function convertToDecimal(num: number, decimals: number): number {
  num /= 10 ** decimals;
  return num;
}

export function hexToStr(data: string): string {
  var hex = data.toString();
  var str = '';
  for (let i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

export function getEvent(data: string[], format: string) {
  const params = format.split(',').map(param => param.trim());
  const event = {};
  let len = 0;
  let skip = 0;
  params.forEach((param, i) => {
    const name = param.replace('(uint256)', '').replace('(felt)', '').replace('(felt*)', '');
    const next = i + skip;
    if (len > 0) {
      event[name] = data.slice(next, next + len);
      skip += len - 1;
      len = 0;
    } else {
      if (param.endsWith('(uint256)')) {
        const uint256 = data.slice(next, next + 2);
        event[name] = new SplitUint256(uint256[0], uint256[1]).toUint().toString();
        skip += 1;
      } else {
        event[name] = data[next];
      }
    }
    if (param.endsWith('_len')) len = parseInt(BigInt(data[next]).toString());
  });
  return event;
}
