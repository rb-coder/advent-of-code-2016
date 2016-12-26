import { readFile, ReadStream } from 'fs';
import { Observable, Subscription } from 'rxjs';
import * as md5 from 'md5';

//const id: string = 'abc';
const id: string = 'reyedfim';

const preparedData: Observable<any> = Observable.range(0, Math.pow(10, 10))
    .map((index: number) => id + index)
    .map((hash: string) => md5(hash))
    .filter((hash: string) => hash.indexOf('00000') === 0)

const result1: Observable<string> = preparedData
    .map((hash: string) => hash.charAt(5))
    .take(8)
    .reduce((code: string, char: string, index: number) => code += char)
    .map((code: string) => code.substr(0, 8))
    .map((code: string) => 'Part one response: ' + code);

const result2: Observable<any> = preparedData
    .map((hash: string) => [hash.charAt(5), hash.charAt(6)])
    .filter(([index, char]: string[]) => /[0-7]/ig.test(index))
    .distinct((code: string[]) => code[0])
    .take(8)
    .reduce((code: string, [index, char]: string[]) => 
        code.substring(0, parseInt(index, 10)) + char + code.substring(parseInt(index, 10) + 1), '________')
    .map((code: string) => 'Part two response: ' + code);

Observable
    .concat(result1, result2)
    .subscribe(console.log);
  