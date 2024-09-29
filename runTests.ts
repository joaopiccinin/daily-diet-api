import { execSync } from 'child_process'

const testFiles = ['./test/user/user.spec.ts', './test/meal/meal.spec.ts']

testFiles.forEach((file) => {
  console.log(`Running test: ${file}`)
  execSync(`npm test -- ${file}`, { stdio: 'inherit' })
})
