import { readFile, ReadStream } from 'fs';
import { Observable, Subscription } from 'rxjs';

const readFileObservable: any = Observable.bindNodeCallback(readFile);
/*
const data: Observable<any> = Observable.of(`abba[mnop]qrst
abcd[bddb]xyyx
aaaa[qwer]tyui
ioxxoj[asdfgh]zxcvbn`);

const data: Observable<any> = Observable.of(`aba[bab]xyz
xyx[xyx]xyx
aaa[kek]eke
aaa[aaa]ewe
aaa[kek]asdasdsa[eke]assss
zazbz[bzb]cdb`);
*/

const data: Observable<any> = readFileObservable(`${__dirname}/input.txt`)
    .map((fileContent: Buffer) => fileContent.toString());

data
    .flatMap((fileContent: string) => fileContent.split('\n'))
    .filter((message: string) => !/\[[a-z]*([a-z])([a-z])\2\1[a-z]*\]/ig.test(message))
    .filter((message: string) => /([a-z])((?!\1)[a-z])\2\1/ig.test(message.replace(/\[[^\]]+\]/ig, '#')))
    .count()
    .map((count: number) => `Part one response: ${count}`)
    .subscribe(console.log);

data
    .flatMap((fileContent: string) => fileContent.split('\n'))
    .filter((message: string) => (((/([a-z])((?!\1)[a-z])\1.*\[[a-z]*\2\1\2[a-z]*\]/ig.test(message) ? 1 : 0)
                                 ^ (/\[[a-z]*([a-z])((?!\1)[a-z])\1[a-z]*\].*\2\1\2/ig.test(message) ? 1 : 0)) === 1))
    .count()
    .map((count: number) => `Part two response: ${count}`)
    .subscribe(console.log);
