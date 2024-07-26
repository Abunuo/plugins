#!/usr/bin/env node
/*
 * @Date: 2024-06-13 10:40:27
 * @Description: vite-create
 */

import fs from "fs"
import inquirer from "inquirer"
import { program } from "commander"
import { exec, spawn } from "child_process"
import { red, green, yellow } from "kolorist"

let ProjectName = "abunuo-cli-project"

// 流程选择
const preSetRulesList = [
	"default(react,@reduxjs/toolkit,sass,antd,axios,TypeScript)",
	"进入自定义流程",
]
// 自定义流程
const preInstall = [
	{
		name: "cssPreprocessor",
		type: "list",
		message: "你想安装一个css预处理器吗?",
		choices: ["less", "sass", "Stylus", "no"],
	},
	{
		name: "storeFrame",
		type: "list",
		message: "你需要vuex🍕 或者pinia🍍 吗?",
		choices: ["vuex", "pinia", "react-redux", "mobx", "zustand", "no"],
	},
	{
		name: "otherPackages",
		type: "input",
		message: `你需要任何其他包吗(以空格隔开):`,
	},
]

const cleanDir = () => {
	return new Promise(async (resolve, reject) => {
		const dir = process.cwd() + "/" + ProjectName
		if (fs.existsSync(dir)) {
			fs.rmSync(dir, { recursive: true })
		}
		resolve()
	})
}

const cloneRepository = command => {
	return new Promise(async (resolve, reject) => {
		console.log(yellow("克隆仓库中...\n"), `${command} --progress`)
		const child = await exec(
			`${command} --progress`,
			(error, stdout, stderr) => {
				if (error) {
					console.log(`clone error: ${error.message}`)
					reject(error)
				}
			}
		)
		child.stderr.on("data", data => {
			process.stdout.write(data)
		})
		child.stderr.on("end", data => {
			console.log(green("克隆成功"))
			resolve()
		})
	})
}

const initCustomFlow = () => {
	return new Promise(async (resolve, reject) => {
		const child = spawn("pnpm", ["create", "vite@latest", ProjectName], {
			stdio: "inherit",
		})
		child.on("close", code => {
			console.log(green("初始化成功"))
			resolve()
		})
	})
}

const installDependencies = (installCommand = `pnpm install`) => {
	return new Promise((resolve, reject) => {
		console.log(yellow("进入项目目录"), ProjectName)
		process.chdir(`${ProjectName}`)
		console.log(yellow("安装依赖中...\n"), installCommand)
		const child = exec(installCommand, (error, stdout, stderr) => {
			if (error) {
				console.log(`error::: ${error.message}`)
				reject(error)
			}
		})
		child.stdout.on("data", async data => {
			process.stdout.write(data)
		})
		// child.stderr.on("data", async error => {
		// 	process.stdout.write("install error::: " + error.message)
		// })
		child.stdout.on("end", async data => {
			console.log(green("依赖安装成功"))
			resolve()
		})
	})
}

const runProject = async () => {
	const { startServer, command } = await inquirer.prompt([
		{
			name: "startServer",
			type: "list",
			message: "是否需要运行项目",
			choices: ["yes", "no"],
		},
		{
			name: "command",
			type: "input",
			message: "请输入运行命令。默认：pnpm start",
			default: "pnpm start",
			when: answer => answer.startServer === "yes",
		},
	])
	if (startServer === "yes") {
		return new Promise((resolve, reject) => {
			const child = exec(command, (error, stdout, stderr) => {
				if (error) {
					console.log(`error::: ${error.message}`)
					reject(error)
				}
			})
			child.stdout.on("data", async data => {
				process.stdout.write(data)
			})
			child.stdout.on("error", async error => {
				console.log(red(`error::: ${error.message}`))
				reject(child.stdout)
			})
		})
	}
	process.exit(0)
}

const preRulesFlow = async repository => {
	const cloneCommand = `git clone ${repository} ${ProjectName}`
	await cloneRepository(cloneCommand)
	await installDependencies()
}

const customRuleFlow = async () => {
	await initCustomFlow()
	const answer = await inquirer.prompt(preInstall)
	const { cssPreprocessor, storeFrame, otherPackages } = answer
	const installs = []
	if (cssPreprocessor !== "no") {
		installs.push(cssPreprocessor)
	}
	if (storeFrame !== "no") {
		installs.push(storeFrame)
	}
	if (!!otherPackages) {
		installs.push(...otherPackages.split(" "))
	}
	const installsStr = installs.join(" ")
	await installDependencies(
		`pnpm install${installsStr ? ` && pnpm add ${installsStr}` : ""}`
	)
}

const askForOptions = async () => {
	const { selectRule, repository } = await inquirer.prompt([
		{
			name: "selectRule",
			type: "list",
			message: "选择一个预设规则，或者进入自定义流程",
			choices: preSetRulesList,
		},
		{
			name: "repository",
			type: "input",
			message:
				"请输入需要 clone 的仓库地址，默认：https://github.com/Abunuo/react-app-demo.git",
			default: "https://github.com/Abunuo/react-app-demo.git",
			when: answer => answer.selectRule !== "进入自定义流程",
		},
	])
	try {
		await cleanDir()
		if (selectRule === "进入自定义流程") {
			await customRuleFlow()
		} else {
			await preRulesFlow(repository)
		}
		await runProject()
	} catch (error) {
		console.log(red(`初始化失败: ${error.message}`))
		process.exit(0)
	}
}

program
	.name("abunuo-cli")
	.description(`abunuo-cli 是一款用于快速创建 React 项目的脚手架工具`)
	.version("1.0.0")

program
	.command("create")
	.description("使用 abunuo-cli 快速创建项目")
	.argument("[projectName]", "project name")
	.option("-p, --projectName <string>", "project name")
	.action(async (initProjectName, opts) => {
		ProjectName = initProjectName || opts.projectName || ProjectName
		await askForOptions()
	})

program.parse(process.argv)
