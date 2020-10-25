const telegraf = require("telegraf")
const axios = require("axios")
const { config } = require("dotenv")
const Markup = require("telegraf").Markup
const fs = require("fs")

config({
	path: ".env"
})

const bot = new telegraf(process.env.TOKEN)

const categories = JSON.parse(fs.readFileSync("./categories.json"))

bot.command("new", async ctx => {
	let question = (await axios.get("https://opentdb.com/api.php?amount=1&encode=url3986")).data.results[0]
	let answers = [question.correct_answer].concat(question.incorrect_answers)
	let correct_answer = answers[0]
	answers = shuffle(answers)
	ctx.replyWithQuiz(`Category: ${decodeURIComponent(question.category)}\n\n${decodeURIComponent(question.question)}`, answers.map(element => decodeURIComponent(element)), {correct_option_id: answers.indexOf(correct_answer)})
})

bot.command(Object.keys(categories), async ctx => {
	let question = (await axios.get(`https://opentdb.com/api.php?amount=1&category=${categories[ctx.message.text.split(" ")[0].slice(1)][0]}&encode=url3986`)).data.results[0]
	let answers = [question.correct_answer].concat(question.incorrect_answers)
	let correct_answer = answers[0]
	answers = shuffle(answers)
	ctx.replyWithQuiz(`Category: ${decodeURIComponent(question.category)}\n\n${decodeURIComponent(question.question)}`, answers.map(element => decodeURIComponent(element)), {correct_option_id: answers.indexOf(correct_answer)})
})

bot.command("help", ctx => {
    let msg = [["help", "List Of Categories"], ["new", "Random Category\n"]]
	for (let cat in categories) {
		msg.push([cat, categories[cat][1]])
	}
	ctx.reply(" - COMMANDS - \n" + msg.map(item => `/${item[0]} - ${item[1]}`).join("\n"))
})

bot.action(/answer\-.+/, async ctx => {
	console.log(ctx.callbackQuery.data.split("-")[1])
	let index = (ctx.callbackQuery.data.split("-")[1] == 1) ? true : false
	let correct_answer = ctx.callbackQuery.data.split("-")[2]
    ctx.editMessageText(`${(index) ? "Your answer was correct!" : "Your answer was incorrect!"}\ncorrect answer: ${decodeURIComponent(correct_answer)}`)
})

bot.launch()

function shuffle (array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}