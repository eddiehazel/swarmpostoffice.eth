1. remove total events and replace it with "bzz/gb*" - this should have 3 values, small medium large and represented as a grid inside the section that previously had total events. it should be in a 3x2 grid and have the labels, in small writing similar to Dec 3, 2025, 07:38:45 AM from the 1 week ago div, underneath the calculated values. it should calculate the values in bzz/month using the following function which provides a depth to gb conversion: 

            const getSizeForDepth = (depth: number): string => {
              const sizes = [
                '8MB',
                '16MB',
                '32MB',
                '68MB',
                '137MB',
                '274MB',
                '549MB',
                '1.1GB',
                '2.2GB',
                '4.4GB',
                '8.8GB',
                '17.6GB',
                '35.1GB',
                '70.3GB',
                '140.6GB',
                '281.1GB',
                '562.3GB',
              ];
              return sizes[depth - 17] || `${Math.pow(2, depth - 17)} chunks`;
            };

2. change 📊 Avg Change to be 📊 24hr Change and make sure the calculation is correct - i.e % change in one day (allowing for anchored blocks for caching purposes of course) add the actual figure in plur in small writing similar to the date label below
