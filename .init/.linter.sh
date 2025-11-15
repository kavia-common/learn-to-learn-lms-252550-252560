#!/bin/bash
cd /home/kavia/workspace/code-generation/learn-to-learn-lms-252550-252560/learn_to_learn_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

