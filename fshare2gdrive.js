#! /usr/bin/env node
const MAX_BUFFER = 1024*1024*10
const path = require('path')
const util = require('util')
const fs = require('fs')
const http = require('https')

const home_dir = (process.platform === 'win32') ? process.env.HOMEPATH : process.env.HOME;
const creds_path = path.join(home_dir,'.creds')
let creds = {}
const args = process.argv.slice(2)
const rl = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
})

const GREEN = '\x1b[32m%s\x1b[0m'
const RED = '\x1b[31m%s\x1b[0m'
const CYAN = '\x1b[36m%s\x1b[0m'

const FSHARE_LOGIN_PATH = '/api/user/login'
const FSHARE_GET_USER_PATH = '/api/user/get'
const FSHARE_DOWNLOAD_PATH = '/api/session/download'
let fshare = {
	'app_key': 'L2S7R6ZMagggC5wWkQhX2+aDi467PPuftWUMRFSn',
	'user_email': '',
	'password': ''
}

// ************** Promisify standard functions ************
const ask = (questionText) => {
	return new Promise((resolve, reject) => {
		rl.question(questionText, resolve)
	})
}

const exists = (path) => {
	new Promise((resolve, reject) => {
		fs.access(path, (err) => {
			if (err) {
				if (err.code === 'ENOENT') {
				return resolve(false)
			}
			return reject(err)
			}
			resolve(true)
		})
	})
}
fs.exists[util.promisify.custom] = exists
const file_exists = util.promisify(fs.exists)
const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)
const deleteFileAsync = util.promisify(fs.unlink)
const exec = util.promisify(require('child_process').exec)

function request_promisified(params, postData) {
	return new Promise(function(resolve, reject) {
		var req = http.request(params, function(res) {
			// reject on bad status
			if (res.statusCode < 200 || res.statusCode >= 300) {
				return reject(new Error('statusCode=' + res.statusCode))
			}
			// cumulate data
			var body = []
			res.on('data', function(chunk) {
				body.push(chunk)
			})
			// resolve on end
			res.on('end', function() {
				try {
					body = JSON.parse(Buffer.concat(body).toString())
				} catch(e) {
					reject(e)
				}
				resolve(body)
			})
		})
		// reject on request error
		req.on('error', function(err) {
			// This is not a "Second reject", just a different sort of failure
			reject(err)
		})
		if (postData) {
			req.write(postData)
		}
		// IMPORTANT
		req.end()
	})
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
// ******************************************

async function request(options, postData) {
	try {
		let body = await request_promisified(options, postData)
		return body
	} catch (e) {
		let waitTime = 2
		console.error(RED, `Retry request ${options.path} with wait time ${waitTime}s...`)
		await sleep(waitTime * 1000)
		return await request(options, postData)
	}
}


async function transfer(fshare_file, remote_drive, remote_path) {
	fshare_file = fshare_file.match(/https*.+?\/file\/\w+/)[0]
	// let fshare_folder = args[0].match(/http\s*:.+?\/folder\/\w+/)[0]
	let options = {
		'method': 'POST',
		'hostname': 'api2.fshare.vn',
		'port': 443,
		'path': FSHARE_DOWNLOAD_PATH,
		'headers': {'Cookie': `session_id=${creds.session_id}`}
	}
	let data = {
		'url': fshare_file,
		'token': creds.token,
		'password': ''
	}
	try {
		body = await request(options, JSON.stringify(data))
		fshare_download_url = body.location
		file_name = decodeURI(fshare_download_url.match(/http.+\/(.+?)$/)[1])
		if (remote_drive === undefined || remote_path === undefined) {
			console.log(fshare_download_url)
		} else {
			rclone_path = `"${remote_drive}":"${remote_path.replace(/\/$/,'')}/${file_name}"`
			transfer_cmd = `curl -s "${fshare_download_url}" | rclone rcat --stats-one-line -P --stats 2s ${rclone_path}`
			console.error(GREEN, `Uploading ${fshare_file} to rclone path ${rclone_path}. Please wait...`)
			console.log(transfer_cmd)
		}
	} catch(e) {console.error(RED, e)}
}

async function genCmd(fshare_folder, remote_drive, remote_path, page=1, is_root_folder=true) {
	const folder_code = fshare_folder.match(/folder\/(\w+)$/)[1]
	const FSHARE_FOLDER_PATH = `/api/v3/files/folder?linkcode=${folder_code}&sort=type,-modified&page=${page}`
	
	let options = {
		'method': 'GET',
		'hostname': 'www.fshare.vn',
		'port': 443,
		'path': FSHARE_FOLDER_PATH
	}
	try {
		const body = await request(options, false)
		const promises = body.items.map(async item => {
			if (item.type === 1) {
				let cmd = `curl -s https://raw.githubusercontent.com/fmusicvn/fmusic/master/fshare2gdrive.js | tail -n+2 | node - "https://fshare.vn/file/${item.linkcode}" "${remote_drive}" "${remote_path.replace(/\/$/,'')}/${(is_root_folder ? body.current.name + '/' : '')}" | bash -s`
				console.log(cmd)
			}	else {
				item_folder = `https://fshare.vn/folder/${item.linkcode}`
				item_path = `${remote_path.replace(/\/$/,'')}/${body.current.name}/${item.name}/`
				await genCmd(item_folder, remote_drive, item_path, 1, false)
			}
		})
		await Promise.all(promises)
		if (body._links.last !== undefined) {
			await genCmd(fshare_folder, remote_drive, remote_path, page+1)
		}
	} catch (e) {
		console.error(RED, e)
		process.exit(1)
	}
}

})();
