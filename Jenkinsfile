pipeline {
    agent any
    stages {
        stage("build") {
            steps {
                echo "---- Pulling latest code from git ----"
                sh "npm install"
                echo "------- Installed dependencies -------"
            }
        }
        stage("test") {
            steps {
                echo "------- Testing -------"
            }
        }
        stage("deploy") {
            when {
                expression {
                    currentBuild.result == null || currentBuild.result == 'SUCCESS' 
                }
            }
            steps {
                echo "------ Deploying ------"
                sh "chmod +x deploy.sh"
                sh "./deploy.sh"
                echo "------- Deployment Completed -------"
            }
        }
    }
}