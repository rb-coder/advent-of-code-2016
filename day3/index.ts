import { readFile, ReadStream } from 'fs';
import { Observable, Subscription } from 'rxjs';

const readFileObservable: any = Observable.bindNodeCallback(readFile);

const areValidTriangleDimensions = (dimensions: number[]): boolean => {
    return dimensions[0] < dimensions[1] + dimensions[2] 
            && dimensions[1] < dimensions[0] + dimensions[2] 
            && dimensions[2] < dimensions[1] + dimensions[0];
};

//const data: Observable<any> = Observable.of('5 10 25')

//const data: Observable<any> = Observable.of(`101 301 501
//102 302 502
//103 303 503
//201 401 601
//202 402 602
//203 403 603`)

const data: Observable<any> = readFileObservable(`${__dirname}/input.txt`)
    .map((fileContent: Buffer) => fileContent.toString());

const preparedData: Observable<any> = data
    .map((fileContent: string) => fileContent.split('\n'))
    .flatMap((dimensions: string[]) => Observable.from(dimensions))
    .map((dimensions: string) => dimensions.trim())
    .map((dimensions: string) => dimensions.split(/\s+/ig))
    .map((dimensions: string[]) => dimensions.map((dimension: string) => parseInt(dimension, 10)));

const result1: Observable<string> = preparedData
    .count(areValidTriangleDimensions)
    .map((count: number) => 'Part one response: ' + count);    

const result2: Observable<string> = preparedData
    .bufferCount(3)
    .map((triangleDimensions: number[][]) => 
        triangleDimensions[0]
            .map((dimension: number, index: number) => 
                triangleDimensions.map((row: number[]) => row[index])))
    .flatMap((triangleDimensions: number[][]) => Observable.from(triangleDimensions))
    .count(areValidTriangleDimensions)
    .map((count: number) => 'Part two response: ' + count);

Observable
    .concat(result1, result2)
    .subscribe(console.log);
