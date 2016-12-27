import { readFile, ReadStream } from 'fs';
import { Observable, Subscription } from 'rxjs';

const readFileObservable: any = Observable.bindNodeCallback(readFile);
/*
const data: Observable<any> = Observable.of(`eedadn
drvtee
eandsr
raavrd
atevrs
tsrnev
sdttsa
rasrtv
nssdts
ntnada
svetve
tesnvt
vntsnd
vrdear
dvrsen
enarar`);
*/
const data: Observable<any> = readFileObservable(`${__dirname}/input.txt`)
    .map((fileContent: Buffer) => fileContent.toString());

data
    .flatMap((fileContent: string) => fileContent.split('\n'))
    .map((message: string) => message.split(''))
    .reduce((message: string[][], letters: string[]) => {
        letters.forEach((letter: string, index: number) => {
            if (!message[index]) {
                message[index] = [];
            }
            message[index].push(letter);
        })
        return message;
    }, [])
    .flatMap((message: string[][]) => Observable.from(message))
    .map((letters: string[]) => letters.sort())
    .map((letters: string[]) => letters.reduce((result: string[][], letter: string, index: number, letters: string[]) => {
        if (result.length < 1 || result[result.length - 1][0] !== letter ) {
            result.push([letter, '1']);
        } else {
            result[result.length - 1][1] = '' + (parseInt(result[result.length - 1][1], 10) + 1);
        }
        return result;
    }, []))
    .map((letters: string[][]) => letters.sort((letterA: string[], letterB: string[]) => parseInt(letterB[1], 10) - parseInt(letterA[1], 10)))
    .map(((letters: string[][]) => [letters[0][0], letters[letters.length - 1][0]]))
    .reduce((messages: string[], letters: string[]) => {
        letters.forEach((letter: string, index: number) => {
            messages[index] += letter;
        })
        return messages;
    }, ['', ''])
    .flatMap((messages: string[]) => Observable.from(messages))
    .zip(Observable.of('one', 'two'), (message: string, description: string) => `Part ${description} response: ${message}`)
    .subscribe(console.log);
  