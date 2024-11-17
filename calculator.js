$(document).ready(function() {
    let chart;
    $('#calculatorForm').submit(function(e) {
        generateGraph(e);
    });
    //generateGraph();
    function generateGraph(e) {
        e.preventDefault();
        let equations = $('#equations').val().split(','); // Split equations by comma
        let minX = parseFloat($('#minX').val());
        let maxX = parseFloat($('#maxX').val());
        let selectedGraphType = $('#graphType').val(); // Read the selected graph type from the dropdown
        let smoothness = parseFloat($('#smoothness').val()) || 0.1; // Smoothness control for intervals

        if (isNaN(minX) || isNaN(maxX) || minX >= maxX || isNaN(smoothness) || smoothness <= 0) {
            alert('Invalid range or smoothness value. Please check your input.');
            return;
        }

        let canvas = document.getElementById('graph').getContext('2d');
        let xValues = [];
        let datasets = [];

        for (let equation of equations) {
            equation = equation.trim(); // Remove leading/trailing spaces
            let yValues = [];

            // Preprocess the equation to replace `^` with `**` for exponentiation
            let processedEquation = equation.replace(/\^/g, '**');

            try {
                // Create a new function for evaluating the equation
                let equationFunc = new Function('x', `
                    with (Math) { 
                        return ${processedEquation}; 
                    }
                `);

                for (let x = minX; x <= maxX; x += smoothness) {
                    let result = equationFunc(x);

                    // Check if the result is a valid number within a reasonable range
                    if (!isNaN(result) && isFinite(result)) {
                        xValues.push(x);
                        yValues.push(result);
                    }
                }

                datasets.push({
                    label: equation,
                    data: yValues,
                    borderColor: getRandomColor(),
                    borderWidth: 2,
                    pointRadius: 0, // Hide points for smoother appearance
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
