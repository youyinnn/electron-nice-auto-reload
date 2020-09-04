if [ $1 == 'login' ]
then 
    npm login --registry http://registry.npmjs.org
elif [ $1 == 'publish' ]
then
    npm publish --registry http://registry.npmjs.org
elif [ $1 == 'unpublish' ]
then 
    npm unpublish --registry http://registry.npmjs.org
fi