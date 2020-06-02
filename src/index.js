import { EightPuzzle, EightPuzzleProblem, classicManhattanDistance } from './PuzzleProblem';
import { aStar } from './SearchProblem';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';

class Square extends React.Component {
  render() {
    return (
      <button className="square">
        { (this.props.value) ? this.props.value : "" }
      </button>
    );
  }
}

class Board extends React.Component {
  renderSquare(i) {
    return <Square value={i} />;
  }

  renderRow(row) {
    const items = [];
    for (let col = 0; col < this.props.puzzle.size; col++) {
      items.push(this.renderSquare(this.props.puzzle.board[row][col]));
    }
    return <div className="board-row">
      {items}
    </div>
  }

  renderPuzzle() {
    const items = [];
    for (let row = 0; row < this.props.puzzle.size; row++) {
      items.push(this.renderRow(row));
    }
    return items;
  }

  render() {
    return (
      <div>
        <div className="title">8-Puzzle Demo</div>
          {this.renderPuzzle()}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor() {
    super();
    this.puzzle = new EightPuzzle([
      [8, 7, 6],
      [5, 4, 3],
      [2, 1, 0]
    ]);
  }

  animate(actions, i) {
    setTimeout( () => {
      if (i < actions.length) {
        this.puzzle.move(actions[i]);
        this.forceUpdate();
        this.animate(actions, i + 1);
      }
    }, 500)
  }

  solvePuzzle() {
    let problem = new EightPuzzleProblem(this.puzzle,
      new EightPuzzle(
          [[0, 1, 2], [3, 4, 5], [6, 7, 8]]));
  
    // Null heuristic just for testing
    let solution = aStar(problem, (state) => classicManhattanDistance(state));
    this.animate(solution, 0)
    alert("Solved in " + solution.length + " steps")
  }

  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board puzzle={this.puzzle}/>
        </div>
        <div className="game-info">
          <div>
            <button 
              type="button"
              className="btn btn-success"
              onClick={ () => { this.solvePuzzle() }}>
              Solve!
            </button>
          </div>
          <div>
            <button 
              type="button"
              className="btn btn-primary"
              onClick={() => { this.puzzle.randomize(); this.forceUpdate() }}>
              Randomize
            </button>
            </div>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
