import { 
    aStar,
    RouteProblemState,
    RouteProblem 
} from "../src/SearchProblem";
  
describe('Route problem', function() {
    it('Simple Route problem (down down) solution', function() {
        let problem = new RouteProblem(
            [0, 0],
            [2, 0],
            [[true, true, true], [true, true, true], [false, true, true]])
        let solution = aStar(problem, (state: RouteProblemState) : number => {
            return Math.abs(
                state.position[0] - problem.goalPosition[0])
                + Math.abs(state.position[1] - problem.goalPosition[1])
        })
        expect(solution[0] == "down" && solution[1] == "down").toBeTruthy();
    });

    it('Debug visiting problem', function() {
        let problem = new RouteProblem(
            [1, 0],
            [0, 1],
            [[true, true, false], [false, false, false], [false, false, false]])
        let solution = aStar(problem, (state: RouteProblemState) : number => {
            return Math.abs(
                state.position[0] - problem.goalPosition[0])
                + Math.abs(state.position[1] - problem.goalPosition[1])
        })

        expect(solution[0] == "up" && solution[1] == "right").toBeTruthy();
    });
})