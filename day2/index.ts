import { readFile, ReadStream } from 'fs';
import { Observable, Subscription } from 'rxjs';

const readFileObservable: any = Observable.bindNodeCallback(readFile);
const keypad1: string[][] = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9']
];
const keypad2: string[][] = [
    [  '',  '', '1',  '',  ''],
    [  '', '2', '3', '4',  ''],
    [ '5', '6', '7', '8', '9'],
    [  '', 'A', 'B', 'C',  ''],
    [  '',  '', 'D',  '',  '']
];
const moveIfPossible = (location: number[], move: number[], keypad: string[][]): number[] => {
    const newLocation: number[] = [location[0] + move[0], location[1] + move[1]];

    if (newLocation[0] >= 0 && newLocation[0] < keypad.length) {
        if (newLocation[1] >= 0 && newLocation[1] < keypad[newLocation[0]].length) {
            if (keypad[newLocation[0]][newLocation[1]] !== '') {
                return newLocation;
            }
        }
    }
    return location;
};
const applyInstructionToCode = (code: number[][], instruction: string, keypad: string[][]): number[][] => {
    const newCode: number[][] = code.slice(0, code.length - 1);
    const lastLocation: number[] = code.pop();

    switch (instruction) {
        case '#': 
            newCode.push(lastLocation, lastLocation);
            break;
        case 'U':
            newCode.push(moveIfPossible(lastLocation, [-1, 0], keypad));
            break;
        case 'D':
            newCode.push(moveIfPossible(lastLocation, [1, 0], keypad));
            break;
        case 'L': 
            newCode.push(moveIfPossible(lastLocation, [0, -1], keypad));
            break;
        case 'R': 
            newCode.push(moveIfPossible(lastLocation, [0, 1], keypad));
            break;
    }
    return newCode;
};

//const data: Observable<string> = Observable.of(`ULL
//RRDDD
//LURDL
//UUUUD`)

const data: Observable<string> = readFileObservable(`${__dirname}/input.txt`)
    .map((fileContent: Buffer) => fileContent.toString());

const preparedData: Observable<any> = data    
    .map((instructions: string) => instructions.replace(/[^URDL]+/ig, '#'))
    .map((instructions: string) => instructions.split(''))
    .flatMap((instructions: string[]) => Observable.from(instructions));

const result1: Observable<string> = preparedData
    .reduce((code: number[][], instruction: string, index: number) => {
        return applyInstructionToCode(code, instruction, keypad1);
    }, [[1, 1]])
    .flatMap((code: number[][]) => Observable.from(code))
    .map((position: number[]) => keypad1[position[0]][position[1]])
    .reduce((code: string, digit: string, index: number) => code + digit, '')
    .map((code: string) => 'Part one response: ' + code);

const result2: Observable<string> = preparedData
    .reduce((code: number[][], instruction: string, index: number) => {
        return applyInstructionToCode(code, instruction, keypad2);
    }, [[3, 0]])
    .flatMap((code: number[][]) => Observable.from(code))
    .map((position: number[]) => keypad2[position[0]][position[1]])
    .reduce((code: string, digit: string, index: number) => code + digit, '')
    .map((code: string) => 'Part two response: ' + code);

Observable
    .concat(result1, result2)
    .subscribe(console.log);
    