# Usage examle: 
#  $ time sh testing/repeatUntilFails.sh "npm run test-nobuild"

counter=0
while true; do 
    eval $1
    if [[ "$?" -ne 0 ]]; then 
        echo
        echo "*******"
        echo " * FAILURE at loop #"$counter
        echo "*******"
        echo
        exit 1
    fi
    counter=$((counter+1))
    echo
    echo "*******"
    echo " * TIME: "$counter
    echo "*******"
    echo
    sleep 2s
done
