/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			animation: {
				'rise-quick': 'rise 0.6s ease-out' // Quick rising animation
			},
			keyframes: {
				rise: {
					'0%': { transform: 'translateY(20px)', opacity: '0' }, // Start slightly below, invisible
					'100%': { transform: 'translateY(0)', opacity: '1' } // End in place, fully visible
				}
			}
		}
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: ['emerald', 'dark'], // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
		base: true, // applies background color and foreground color for root element by default
		styled: true, // include daisyUI colors and design decisions for all components
		utils: true, // adds responsive and modifier utility classes
		prefix: '', // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
		logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
		themeRoot: ':root' // The element that receives theme color CSS variables
	}
};
