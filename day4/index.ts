import { readFile, ReadStream } from 'fs';
import { Observable, Subscription } from 'rxjs';

const readFileObservable: any = Observable.bindNodeCallback(readFile);

const isValidRoom = (name: string, checksum: string): boolean => {
    return checksum === name.replace(/[^a-z]/ig, '').split('').sort()
        .reduce((letters: string[], letter: string, index: number) => {
            if (letters.length < 2 || letters[letters.length - 1] !== letter) {
                letters.push('1');
                letters.push(letter);
            } else {
                letters[letters.length - 2] = `${parseInt(letters[letters.length - 2], 10) + 1}`;
            }
            return letters;
        }, [])
       .reduce((letters: string[], letter: string, index: number) => {
            if (index % 2 === 0) {
                letters.push(letter)
            } else {
                letters[letters.length-1] += letter;
            }
            return letters;
        }, [])
        .sort((letterWithCountA, letterWithCountB) => {
            const firstCriteria = letterWithCountB.charAt(0).localeCompare(letterWithCountA.charAt(0));
            if (firstCriteria === 0) {
                return letterWithCountA.charAt(1).localeCompare(letterWithCountB.charAt(1));
            }
            return firstCriteria;
        })
        .slice(0, 5)
        .map((letterWithCount: string) => letterWithCount.charAt(1))
        .join('');
};

const decryptRoomName = (name: string, rotationCount: number): any => {
    const space: number = ' '.charCodeAt(0);
    const dash: number = '-'.charCodeAt(0);
    const a: number = 'a'.charCodeAt(0);
    const z: number = 'z'.charCodeAt(0);

    return name
        .split('')
        .map((letter) => letter.charCodeAt(0))
        .map((charCode) => {
            if (charCode === dash) {
                return space;
            }
            return a + (((charCode - a + rotationCount) % (z-a+1)));
        })
        .map((charCode) => String.fromCharCode(charCode))
        .join('');
};

//console.log(decryptRoomName('qzmt-zixmtkozy-ivhz', 343));

/*
const data: Observable<any> = Observable.of(`aaaaa-bbb-z-y-x-123[abxyz]
a-b-c-d-e-f-g-h-987[abcde]
not-a-real-room-404[oarel]
totally-real-room-200[decoy]`);
*/

const data: Observable<any> = readFileObservable(`${__dirname}/input.txt`)
    .map((fileContent: Buffer) => fileContent.toString());

const preparedData: Observable<any> = data
    .map((fileContent: string) => fileContent.split('\n'))
    .flatMap((rooms: string[]) => Observable.from(rooms))
    .map((room: string) => room.trim())
    .map((room: string) => room.split(/-\d+/ig).map((part: string) => part.replace(/\[|\]/ig, '')).concat(room.replace(/[^\d]/ig, '')))
    .filter((room: string[]) => isValidRoom(room[0], room[1]));

const result1: Observable<string> = preparedData
    .map((room: string[]) => room[2])
    .map((sector: string) => parseInt(sector, 10))
    .reduce((sum: number, sector: number, index: number) => sum += sector, 0)
    .map((sum: number) => 'Part one response: ' + sum);

const result2: Observable<string> = preparedData
    .map((room: string[]) => room.concat(decryptRoomName(room[0], parseInt(room[2], 10))))
    .first((room: string[], index: number) => room[3] === 'northpole object storage')
    .map((room: string[]) => room[2])
    .map((sector: string) => parseInt(sector, 10))
    .map((sector: number) => 'Part two response: ' + sector);

Observable
    .concat(result1, result2)
    .subscribe(console.log);
  