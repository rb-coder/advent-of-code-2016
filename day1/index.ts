import { readFile, ReadStream } from 'fs';
import { Observable } from 'rxjs';

enum Direction {
    N = 0, E = 1, S = 2, W = 3
}

enum  Turn {
    L = -1, R = 1
}

class Instruction {
    public turn: Turn;
    public blocks: number; 

    constructor(instruction: string) {
        const turnInstruction = instruction.substr(0, 1);
        const blocksInstruction = instruction.substr(1);

        switch(turnInstruction) {
            case 'R': 
                this.turn = Turn.R;
                break;
            case 'L': 
                this.turn = Turn.L;
                break;
            default:
                console.error('Invalid instruction', instruction);
        }

        this.blocks = parseInt(blocksInstruction, 10);
    }
}

class Coordinates {
    constructor(public x: number, public y: number) {}
}

class Position {
    constructor(public coordinates: Coordinates, public direction: Direction, public visits: number = 1) {}

    static distance(positionA: Position, positionB: Position): number {
        return Math.abs(positionA.coordinates.x - positionB.coordinates.x) + Math.abs(positionA.coordinates.y - positionB.coordinates.y);
    }

    static locationsTravelled(initialPosition: Position, instruction: Instruction): Position[] {
        let newDirection: Direction = Position.applyTurn(initialPosition.direction, instruction.turn);
        const coordinates: Coordinates = initialPosition.coordinates;
        const visitedPositions: Position[] = [];

        for (let step = 1; step <= instruction.blocks; step++) {
            switch(newDirection) {
                case Direction.N:
                    visitedPositions.push(new Position(new Coordinates(coordinates.x + step, coordinates.y), newDirection));
                    break;
                case Direction.E:
                    visitedPositions.push(new Position(new Coordinates(coordinates.x, coordinates.y + step), newDirection));
                    break;
                case Direction.S:
                    visitedPositions.push(new Position(new Coordinates(coordinates.x - step, coordinates.y), newDirection));
                    break;
                case Direction.W:
                    visitedPositions.push(new Position(new Coordinates(coordinates.x, coordinates.y - step), newDirection));
                    break;
            }
        }

        return visitedPositions;
    }

    static applyTurn(initialDirection: Direction, turn: Turn): Direction {
        return (4 + initialDirection + turn) % 4;
    }

    static update(initialPosition: Position, instruction: Instruction): Position {
        let newDirection: Direction = Position.applyTurn(initialPosition.direction, instruction.turn);
        let newCoordinates: Coordinates;

        switch(newDirection) {
            case Direction.N:
                newCoordinates = new Coordinates(initialPosition.coordinates.x + instruction.blocks, initialPosition.coordinates.y);
                break;
            case Direction.E:
                newCoordinates = new Coordinates(initialPosition.coordinates.x, initialPosition.coordinates.y + instruction.blocks);
                break;
            case Direction.S:
                newCoordinates = new Coordinates(initialPosition.coordinates.x - instruction.blocks, initialPosition.coordinates.y);
                break;
            case Direction.W:
                newCoordinates = new Coordinates(initialPosition.coordinates.x, initialPosition.coordinates.y - instruction.blocks);
                break;
        }
        
        return new Position(newCoordinates, newDirection);
    }
};

const initialPosition = new Position(new Coordinates(0, 0), Direction.N);
const readFileObservable = Observable.bindNodeCallback(readFile);

//const data = Observable.of('R2, L3')
//const data = Observable.of('R2, R2, R2')
//const data = Observable.of('R5, L5, R5, R3')
//const data = Observable.of('R8, R4, R4, R8')


const data: Observable<string> = readFileObservable('./day1/input.txt')
    .map((fileContent: Buffer) => fileContent.toString());

const preparedData: Observable<any> = data
    .map((fileContent: string) => fileContent.split(','))
    .flatMap((instructions: string[]) => Observable.from(instructions))
    .map((instruction: string) => instruction.trim())
    .map((instruction: string) => new Instruction(instruction));

const result1: Observable<string> = preparedData
    .reduce(Position.update, initialPosition)
    .map((position: Position) => Position.distance(initialPosition, position))
    .map((distance: number) => 'Part one response: ' + distance);

const result2: Observable<string> = preparedData
    .mergeScan((position: Position, instruction: Instruction) => {
        return Observable.from(Position.locationsTravelled(position, instruction));
    }, initialPosition)
    .reduce((positions: Position[], position: Position, index: number) => {
        const previousVisit: Position = positions.reduce((foundPosition: Position, currentPosition: Position, index: number) => {
                if (!foundPosition 
                    && currentPosition.coordinates.x === position.coordinates.x 
                    && currentPosition.coordinates.y === position.coordinates.y) {
                        foundPosition = currentPosition;
                }
                return foundPosition;
            }, null);

        if (previousVisit) {
            previousVisit.visits++;
        } else {
            positions.push(position);
        }

        return positions;
    }, [])
    .flatMap((positions: Position[]) => Observable.from(positions))
    .first((position: Position, index: number) => position.visits > 1)
    .map((position: Position) => Position.distance(initialPosition, position))
    .map((distance: number) => 'Part two response: ' + distance);

Observable
    .concat(result1, result2)
    .subscribe(console.log);
