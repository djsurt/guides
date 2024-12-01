$(document).ready(function() {
    let chart;
    
    $('#calculatorForm').submit(function(e) {
        generateGraph(e);
    });

    function generateGraph(e) {
        e.preventDefault();
        let equations = $('#equations').val().split(','); // Split equations by comma
        let minX = parseFloat($('#minX').val());
        let maxX = parseFloat($('#maxX').val());
        let minY = parseFloat($('#minY').val()) || minX; // Default to minX if not provided
        let maxY = parseFloat($('#maxY').val()) || maxX; // Default to maxX if not provided
        let selectedGraphType = $('#graphType').val();
        let smoothness = parseFloat($('#smoothness').val()) || 0.1;

        if (isNaN(minX) || isNaN(maxX) || minX >= maxX || 
            isNaN(minY) || isNaN(maxY) || minY >= maxY || 
            isNaN(smoothness) || smoothness <= 0) {
            alert('Invalid range or smoothness value. Please check your input.');
            return;
        }

        let canvas = document.getElementById('graph').getContext('2d');
        let datasets = [];

        for (let equation of equations) {
            equation = equation.trim();
            let processedEquation = equation.replace(/\^/g, '**');
            
            try {
                // Detect if the equation is implicit (contains 'x' and 'y')
                const isImplicit = processedEquation.includes('x') && processedEquation.includes('y');
                
                if (isImplicit) {
                    datasets.push(...solveImplicitFunction(processedEquation, minX, maxX, minY, maxY, smoothness));
                } else {
                    datasets.push(solveExplicitFunction(processedEquation, minX, maxX, smoothness));
                }
            } catch (error) {
                console.error(error);
                alert(`Invalid equation: "${equation}". Please check your input.`);
                return;
            }
        }

        if (chart) chart.destroy();

        chart = new Chart(document.getElementById('graph'), {
            type: selectedGraphType,
            data: {
                datasets: datasets,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'center',
                        title: { display: true, text: 'X' }
                    },
                    y: {
                        type: 'linear',
                        position: 'center',
                        title: { display: true, text: 'Y' }
                    }
                }
            }
        });

        $('.graphic-container').addClass('active');
    }

    function solveExplicitFunction(equation, minX, maxX, smoothness) {
        let xValues = [];
        let yValues = [];

        for(let i = 0; i <= (maxX - minX)/smoothness; ++i){
            let x = minX + i*smoothness;
            x = Math.round(x * 10) / 10;
            xValues.push(x);
        }

        let equationFunc = new Function('x', `
            with (Math) { 
                return ${equation}; 
            }
        `);

        for (let x of xValues) {
            let result = equationFunc(x);
            
            if (!isNaN(result) && isFinite(result)) {
                yValues.push(result);
            } else {
                yValues.push(null);
            }
        }

        return {
            label: equation,
            data: yValues,
            borderColor: getRandomColor(),
            borderWidth: 2,
            pointRadius: 0,
            tension: 1.0,
            parsing: {
                xAxisKey: null,
                yAxisKey: null
            }
        };
    }

    function solveImplicitFunction(equation, minX, maxX, minY, maxY, smoothness) {
        let points = [];
        
        // Create a function to evaluate the implicit equation
        let implicitFunc = new Function('x', 'y', `
            with (Math) { 
                return ${equation} ? 1 : 0; 
            }
        `);

        // Marching squares algorithm to trace the contour
        for (let x = minX; x <= maxX; x += smoothness) {
            for (let y = minY; y <= maxY; y += smoothness) {
                // Check if the point is close to the contour
                let value = implicitFunc(x, y);
                if (Math.abs(value) < 0.1) {
                    points.push({ x, y });
                }
            }
        }

        return {
            label: equation,
            data: points,
            borderColor: getRandomColor(),
            borderWidth: 2,
            pointRadius: 1,
            showLine: true,
            fill: false
        };
    }

    function getRandomColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }

    // Existing theme toggle code remains the same...
    // (theme toggle function from original script)
});