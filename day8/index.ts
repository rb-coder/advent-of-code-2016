import { readFile, ReadStream } from 'fs';
import { Observable, Subscription } from 'rxjs';

const readFileObservable: any = Observable.bindNodeCallback(readFile);

/*
const width: number = 7;
const letterWidth: number = 7;
const height: number = 3;
const data: Observable<any> = Observable.of(`rect 3x2
rotate column x=1 by 1
rotate row y=0 by 4
rotate column x=1 by 1`);
*/

const width: number = 50;
const letterWidth: number = 5;
const height: number = 6;
const data: Observable<any> = readFileObservable(`${__dirname}/input.txt`)
    .map((fileContent: Buffer) => fileContent.toString());

const screen: boolean[][] = ((width: number, height: number): boolean[][] => {
    const screen: boolean[][] = [];
    for (let i:number = 0; i<height; i++) {
        screen[i] = [];
        for (let j:number = 0; j<width; j++) {
            screen[i][j] = false;
        }
    }
    return screen;
})(width, height);

const preparedData: Observable<any> = data
    .flatMap((fileContent: string) => fileContent.split('\n'))
    .map((instruction: string) => instruction.split(' '))
    .map((instruction: string[]) => {
        const command = instruction[0];
        switch (command) {
            case 'rect':
                const size: number[] = instruction[1]
                    .split('x')
                    .map((size: string) => parseInt(size, 10));

                return (screen: boolean[][]): boolean[][] => {
                    const toRow: number = Math.min(size[0], screen[0].length)
                    const toColumn: number = Math.min(size[1], screen.length);

                    for (let i:number = 0; i<toColumn; i++) {
                        for (let j:number = 0; j<toRow; j++) {
                            screen[i][j] = true;
                        }
                    }
                    return screen;
                };
            case 'rotate':
                const direction: string = instruction[1];
                const ammount: number = parseInt(instruction[4], 10);
                const id: number = parseInt(instruction[2].substring(instruction[2].indexOf('=') + 1), 10);
                switch (direction) {
                    case 'column':
                        return (screen: boolean[][]): boolean[][] => {
                            const length: number = screen.length;
                            const normedAmmount: number = ammount % length;
                            const buffer: boolean[] = screen.map((row: boolean[]) => row[id]);

                            for (let i:number = 0; i<normedAmmount; i++) {
                                buffer.unshift(buffer.pop());
                            }

                            buffer.forEach((value: boolean, index: number) => screen[index][id] = value);

                            return  screen;
                        };
                    case 'row':
                        return (screen: boolean[][]): boolean[][] => { 
                            const length: number = screen[id].length;
                            const normedAmmount: number = ammount % length;
                            const buffer: boolean[] = screen[id].map((value: boolean) => value);
                            
                            for (let i:number = 0; i<normedAmmount; i++) {
                                buffer.unshift(buffer.pop());
                            }

                            buffer.forEach((value: boolean, index: number) => screen[id][index] = value);
                            return  screen;
                        };
                }
            default: 
                console.log('Invalid instruction', instruction);
                return (screen: boolean[][]): boolean[][] => screen;
        }
    })
    .scan((screen: boolean[][], modifier: Function) => modifier(screen), screen)
    .last()
    .publishReplay(1)
    .refCount();

const result1: Observable<string> = preparedData    
    .flatMap((screen: boolean[][]) => Observable.from(screen))
    .flatMap((row: boolean[]) => Observable.from(row))
    .filter((dot: boolean) => dot)
    .count()
    .map((count: number) => `Part one response: ${count}`);

const result2: Observable<any> = preparedData
    .map((screen: boolean[][]) => 
        screen.map((row: boolean[]) => row.map((item: boolean, index: number) => 
            (index && index % letterWidth === 0 ? '  ' : '') + (item ? '*' : ' '))))
    .map((screen: string[][]) => screen.map((row: string[]) => row.join('')).join('\n'))
    .map((message: String) => `Part two response:
${message}`);

Observable
    .concat(result1, result2)
    .subscribe(console.log);
