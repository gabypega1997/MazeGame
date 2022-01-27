const { Engine, Render, Runner, World, Bodies, Body , Events} = Matter;
  // ********************
  //        Game
  //*********************


const horizontalInput = document.querySelector('#HorizontalCells'); 
const verticalInput = document.querySelector('#VerticalCells'); 
const engine = Engine.create();


const game = () => {
const cellsHorizontal = Math.floor( horizontalInput.value);
const cellsVertical = Math.floor(verticalInput.value);
const width = window.innerWidth;
const height = window.innerHeight - 4;
const unitLenghtX = width/cellsHorizontal;
const unitLenghtY = height/cellsVertical;
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes:false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);



//Walls
const walls = [
    Bodies.rectangle(width / 2 , 0, width , 2, {isStatic:true}),
    Bodies.rectangle(width/2, height, width, 2, {isStatic:true}),
    Bodies.rectangle(0 , height / 2, 2, height,{isStatic:true}),
    Bodies.rectangle(width, height / 2 , 2, height,
    {
        isStatic: true,
    })
];

World.add(world, walls);
//Maze generation
const shuffel = (arr) => {
    let counter = arr.length;

    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);

        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
};

const grid = Array(cellsVertical)
.fill(null)
.map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row, column) => {
    //If i have visited the cell at [row, column], then return
    if (grid[row][column] === true) {
        return;
    }

    //Mark this cell as being visited

    grid[row][column] = true;

    //Assemble randomly-ordered list of neighbords
    const neighbors = shuffel([
        [row - 1, column , 'up'],
        [row, column + 1, 'right'],
        [row + 1,column, 'down'],
        [row, column - 1, 'left']

    ]);

    // For each neighbor...
    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;
    //See if that neighbor is out of bounds
        if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
            continue;
        }
    //If we have visited that neighbor, continue to next neighbor
        if(grid[nextRow][nextColumn]){
            continue;
        }

    // Remove a wall from either horizontal or verticals 
        if(direction === 'left') {
            verticals[row][column - 1] = true;
        }else if (direction === 'right') {
            verticals[row][column] = true;
        }else if(direction === 'up') {
            horizontals[row - 1][column]= true;
        }else if (direction === 'down') {
            horizontals[row][column] = true;
        }
        stepThroughCell(nextRow, nextColumn);
    }
    // Visit that nect cell
};

stepThroughCell(startRow,startColumn);

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open === true) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLenghtX + unitLenghtX / 2,
            rowIndex * unitLenghtY + unitLenghtY,
            unitLenghtX,
            5, 
            {
                label:'wall',
                isStatic: true,
                render: {
                    fillStyle:'#b36039'
                }
            }
        );
        World.add(world, wall);
    });

});

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLenghtX + unitLenghtX,
            rowIndex * unitLenghtY + unitLenghtY / 2,
            5,
            unitLenghtY,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle:'#94593d'
                }
            }
        );
        World.add(world, wall);
    });
});

//Goal
const goal = Bodies.rectangle(
    width - unitLenghtX / 2,
    height - unitLenghtY / 2,
    unitLenghtX * .7,
    unitLenghtY * .7,
    {
        label: 'goal',
        isStatic : true,
        render: {
            fillStyle:'#1ec954'
        }
    }
);
World.add(world,goal);

//Ball

const ballRadious = Math.min(unitLenghtX, unitLenghtY) / 4;
const ball = Bodies.circle(
    unitLenghtX / 2,
    unitLenghtY / 2,
    ballRadious,
    {
        label: 'ball',
        render:{
            fillStyle:'#72b4cf'
        }
    }
);
World.add(world, ball);

document.addEventListener('keydown', event => {
   const { x, y} = ball.velocity;
       if (event.keyCode === 87 || event.keyCode === 38  ) {
        Body.setVelocity(ball, {x , y: y - 3.5 });
    }
    if (event.keyCode === 68 || event.keyCode === 39 ) {
        Body.setVelocity(ball, {x: x + 3.5 , y});
    }
    if (event.keyCode === 83 || event.keyCode === 40 ) {
        Body.setVelocity(ball, {x , y: y + 3.5})
    }
    if (event.keyCode === 65 || event.keyCode === 37 ) {
        Body.setVelocity(ball, {x: x - 3.5 , y});
    }
});

//Win condition

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const labels = ['ball', 'goal'];

        if (labels.includes(collision.bodyA.label) && 
        labels.includes(collision.bodyB.label) ){
            document.querySelector('.winner').classList.remove('hidden-win');
            world.gravity.y = 1;
            world.bodies.forEach(body => {
            if (body.label === 'wall') {
                Body.setStatic(body, false);
            }
        
            });
      }
    });
});

over = () => {
    World.clear(world);
    Engine.clear(engine);
    Render.stop(render);
    render.canvas.remove();
    render.canvas = null;
    render.context = null;
    render.textures = {};
}

gravityOn = () => {
    world.gravity.y = 1;
}
gravityOff = () => {
    world.gravity.y = 1
}
}
// Run game default mode
game()

//Setup
const setupButton = document.querySelector('.icon');
const restartWinBtn = document.querySelector('.restartWin');
const restartSetBtn = document.querySelector('.restartSet');
const changeBtn = document.querySelector('.change')
const gravityOnBtn = document.querySelector('.gravityOn')
const gravityOffBtn = document.querySelector('.gravityOff')
const closeBtn = document.querySelector('.close')
const changer = document.querySelector('.changer');

setupButton.addEventListener('click', () => {
    document.querySelector('.setup').classList.toggle('hidden-setup');
});
    
restartWinBtn.addEventListener('click', () => {
    game(over());
    document.querySelector('.winner').classList.toggle('hidden-win');
    
});
restartSetBtn.addEventListener('click', () => {
    document.querySelector('.setup').classList.toggle('hidden-setup');
    game(over());
   
});
changeBtn.addEventListener('click', () => {
    document.querySelector('.changer').classList.toggle('hidden-changer');
    document.querySelector('.setup').classList.toggle('hidden-setup');

});
gravityOnBtn.addEventListener('click', () => {
    engine.world.gravity.y = 1;
});
gravityOffBtn.addEventListener('click', () => {
    engine.world.gravity.y = 0;
});
closeBtn.addEventListener('click', () => {
    document.querySelector('.setup').classList.toggle('hidden-setup');
});

    //Changer

let horizontalValue;
let verticalValue; 
const changeApplyBtn = document.querySelector('.applyBtn')
const changeBackBtn = document.querySelector('.backBtn')

horizontalInput.addEventListener('input', () => {
     horizontalValue = horizontalInput.value;
});
verticalInput.addEventListener('input', () => {
     verticalValue = verticalInput.value;
});
changeApplyBtn.addEventListener('click', () => {
    horizontalInput.setAttribute('value', horizontalValue);
    verticalInput.setAttribute('value', verticalValue);
    document.querySelector('.changer').classList.toggle('hidden-changer');
    game(over());
});
changeBackBtn.addEventListener('click', () => {
    document.querySelector('.changer').classList.toggle('hidden-changer');
    document.querySelector('.setup').classList.toggle('hidden-setup');
});
