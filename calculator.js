$(document).ready(function() {

let chart;
$('#calculatorForm').submit(function(e) {
    e.preventDefault();
    generateGraph();
});
$(document).on("change", "#graphType", function(event) {
    generateGraph();
});

function isImplicitFunction(equation) {
    try {
        // Split the equation into left and right sides
        const sides = equation.split("=");
        if (sides.length !== 2) {
            return false; // Not a valid equation if there's no '='
        }

        const leftSide = sides[0];
        const rightSide = sides[1];

        // Extract variables using a regex (matches variables like x, y, etc.)
        const variableRegex = /[a-zA-Z]+/g;
        const variables = new Set(equation.match(variableRegex));

        if (variables.size < 2) {
            return false; // Not implicit if there are fewer than 2 variables
        }

        // Check if the equation is explicitly solved for one variable
        const isExplicit = [...variables].some(variable => {
            const explicitRegex = new RegExp(`^\\s*${variable}\\s*=`);
            return explicitRegex.test(equation.trim()) || explicitRegex.test(rightSide.trim());
        });

        return !isExplicit; // It's implicit if it's not explicit
    } catch (error) {
        console.error("Error parsing equation:", error);
        return false;
    }
}

//Add functionality to handle implicit functions
function handleImplicitFunction(equationString, minX, maxX, minY, maxY) {
    // Create arrays to store points that satisfy the equation
    const points = [];
    
    // Use math.js to parse the equation
    const [leftSide, rightSide] = equationString.split('=').map(side => side.trim());
    
    // Create a function that evaluates the equation
    const equationFunction = (x, y) => {
      try {
        // Evaluate the left side and right side of the equation
        const leftValue = math.evaluate(leftSide, { x, y });
        const rightValue = math.evaluate(rightSide, { x, y });
        
        // Return the difference (should be close to zero if the point satisfies the equation)
        return Math.abs(leftValue - rightValue);
      } catch (error) {
        console.error('Error evaluating equation:', error);
        return Infinity;
      }
    };
    
    // Step size for x and y (adjust for performance/precision)
    const xStep = (maxX - minX) / 200;
    const yStep = (maxY - minY) / 200;
    
    // Iterate through x and y ranges
    for (let x = minX; x <= maxX; x += xStep) {
      for (let y = minY; y <= maxY; y += yStep) {
        // Check if the point satisfies the equation (close to zero)
        if (equationFunction(x, y) < 0.01) {
          points.push({ x, y });
        }
      }
    }
    return points;
  }

  function plotImplicitFunction(equation, minX, maxX, minY, maxY) {
    // Get points
    const points = handleImplicitFunction(equation, minX, maxX, minY, maxY);

    // Prepare data for Chart.js
    const xData = points.map(p => p.x);
    const yData = points.map(p => p.y);
    console.log(xData);
    console.log(yData);
    return [xData, yData];
    // Create the chart
    // const ctx = document.getElementById('graph').getContext('2d');
    // new Chart(ctx, {
    //     type: 'scatter',
    //     data: {
    //         datasets: [{
    //             label: `Points satisfying ${equation}`,
    //             data: points,
    //             backgroundColor: 'blue',
    //             pointRadius: 1
    //         }]
    //     },
    //     options: {
    //         responsive: true,
    //         scales: {
    //             x: {
    //                 type: 'linear',
    //                 position: 'center',
    //                 min: minX,
    //                 max: maxX
    //             },
    //             y: {
    //                 type: 'linear',
    //                 position: 'center',
    //                 min: minY,
    //                 max: maxY
    //             }
    //         }
    //     }
    // });
}
  
    generateGraph(); // On initial page load
    function generateGraph() {
        //e.preventDefault();
        let equations = $('#equations').val().split(','); // Split equations by comma
        let minX = parseFloat($('#minX').val());
        let maxX = parseFloat($('#maxX').val());
        let minY = parseFloat($('#minY').val());
        let maxY = parseFloat($('#maxY').val());
        let selectedGraphType = $('#graphType').val(); // Read the selected graph type from the dropdown
        let smoothness = parseFloat($('#smoothness').val()) || 0.1; // Smoothness control for intervals

        if (isNaN(minX) || isNaN(maxX) || minX >= maxX || isNaN(smoothness) || smoothness <= 0) {
            alert('Invalid range or smoothness value. Please check your input.');
            return;
        }

        let canvas = document.getElementById('graph').getContext('2d');
        let xValues = [];
        let datasets = [];
        for(let i =0; i <= (maxX - minX)/smoothness; ++i){
            let x = minX + i*smoothness;
            x = Math.round(x * 10) / 10;
            xValues.push(x);
        }

        for (let equation of equations) {
            equation = equation.trim(); // Remove leading/trailing spaces
            // Check for implicit function
            let yValues = [];
            try {
                if(isImplicitFunction(equation)){
                    //Handle implicit function
                    // result = plotImplicitFunction(equation, minX, maxX, minY, maxY);
                    // xValues = result[0];
                    // yValues = result[1];
                }
                else{
        
                    // Preprocess the equation to replace `^` with `**` for exponentiation
                    let processedEquation = equation.replace(/\^/g, '**');
                    // Create a new function for evaluating the equation
                    let equationFunc = new Function('x', `
                        with (Math) { 
                            return ${processedEquation}; 
                        }
                    `);

                    for (let x of xValues) {
                        let result = equationFunc(x);
                    
                        // Check if the result is a valid number
                        if (!isNaN(result) && isFinite(result)) {
                            yValues.push(result);
                        } else {
                            yValues.push(0); // Handle invalid values by setting y to 0
                        }
                    }
                }

                datasets.push({
                    label: equation,
                    data: yValues,
                    borderColor: getRandomColor(),
                    borderWidth: 2,
                    pointRadius: 0, // Hide points for smoother appearance
                    tension: 1.0
                });
            } catch (error) {
                // Handle the error and provide feedback to the user
                console.error(error);
                alert(`Invalid equation: "${equation}". Please check your input.`);
                return;
            }
        }

        if (chart) chart.destroy();

        chart = new Chart(canvas, {
            type: selectedGraphType,
            data: {
                labels: xValues,
                datasets: datasets,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'X'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Y'
                        }
                    }
                }
            }
        });

        $('.graphic-container').addClass('active');
    }

    $('#resetBtn').on('click', () => {
        if (chart) chart.destroy();
        $('.graphic-container').removeClass('active');
    });


    function getRandomColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }

    // Dark Mode and Light Mode theme toggler
    document.body.style="background-color: var(--bs-dark);transition: 0.5s;"
    const sun = "https://www.uplooder.net/img/image/55/7aa9993fc291bc170abea048589896cf/sun.svg";
    const moon = "https://www.uplooder.net/img/image/2/addf703a24a12d030968858e0879b11e/moon.svg"

    var theme = "dark";
    const root = document.querySelector(":root");
    const container = document.getElementsByClassName("theme-container")[0];
    const themeIcon = document.getElementById("theme-icon");
    //container.addEventListener("click", setTheme);
    function setTheme() {
      switch (theme) {
        case "dark":
          setLight();
          theme = "light";
          break;
        case "light":
          setDark();
          theme = "dark";
          break;
      }
    }
    function setLight() {
      root.style.setProperty(
        "--bs-dark",
        "linear-gradient(318.32deg, #c3d1e4 0%, #dde7f3 55%, #d4e0ed 100%)"
      );
      container.classList.remove("shadow-dark");
      setTimeout(() => {
        container.classList.add("shadow-light");
        themeIcon.classList.remove("change");
      }, 300);
      themeIcon.classList.add("change");
      themeIcon.src = sun;
    }
    function setDark() {
      root.style.setProperty("--bs-dark", "#000");
      container.classList.remove("shadow-light");
      setTimeout(() => {
        container.classList.add("shadow-dark");
        themeIcon.classList.remove("change");
      }, 300);
      themeIcon.classList.add("change");
      themeIcon.src = moon;
    }
});
