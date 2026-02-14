pipeline {
    agent any

    environment {
        AWS_REGION      = "ap-south-1"
        ECR_REPO        = "user-service"
        ECR_REGISTRY    = "<account-id>.dkr.ecr.${AWS_REGION}.amazonaws.com"
        IMAGE_TAG       = "${BUILD_NUMBER}"
        CLUSTER_NAME    = "my-eks-cluster"
        SONARQUBE_ENV   = "SonarQubeServer"
    }

    options {
        timestamps()
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '/root/.nvm/versions/node/v16.15.1/bin/npm ci'
            }
        }

        stage('Run Unit Tests') {
            steps {
                sh '/root/.nvm/versions/node/v16.15.1/bin/npm run test:unit'
            }
        }

        stage('Run Integration Tests') {
            steps {
                sh '/root/.nvm/versions/node/v16.15.1/bin/npm run test:integration'
            }
        }

        stage('Generate Coverage Report') {
            steps {
                sh '/root/.nvm/versions/node/v16.15.1/bin/npm run test:coverage'
            }
        }

        stage('SAST - SonarQube Scan') {
            steps {
                withSonarQubeEnv("${SONARQUBE_ENV}") {
                    sh 'sonar-scanner'
                }
            }
        }

        stage('Dependency Scan') {
            steps {
                sh '/root/.nvm/versions/node/v16.15.1/bin/npm audit --audit-level=high || true'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                docker build -t ${ECR_REPO}:${IMAGE_TAG} .
                """
            }
        }

        stage('Docker Image Scan - Trivy') {
            steps {
                sh """
                trivy image --exit-code 0 --severity HIGH,CRITICAL ${ECR_REPO}:${IMAGE_TAG}
                """
            }
        }

        stage('Login to AWS ECR') {
            steps {
                sh """
                aws ecr get-login-password --region ${AWS_REGION} \
                | docker login --username AWS --password-stdin ${ECR_REGISTRY}
                """
            }
        }

        stage('Tag & Push Image') {
            steps {
                sh """
                docker tag ${ECR_REPO}:${IMAGE_TAG} ${ECR_REGISTRY}/${ECR_REPO}:${IMAGE_TAG}
                docker push ${ECR_REGISTRY}/${ECR_REPO}:${IMAGE_TAG}
                """
            }
        }

        stage('Deploy to EKS') {
            steps {
                sh """
                aws eks update-kubeconfig --region ${AWS_REGION} --name ${CLUSTER_NAME}

                kubectl set image deployment/user-service \
                user-service=${ECR_REGISTRY}/${ECR_REPO}:${IMAGE_TAG} \
                --namespace=default

                kubectl rollout status deployment/user-service
                """
            }
        }

        stage('Post Deployment DAST (Optional)') {
            steps {
                sh """
                docker run -t owasp/zap2docker-stable zap-baseline.py \
                -t http://your-alb-url || true
                """
            }
        }
    }

    post {

        success {
            echo "✅ Deployment Successful!"
        }

        failure {
            echo "❌ Pipeline Failed!"
        }

        always {
            cleanWs()
        }
    }
}

