# Ris Queue RabbitMQ



## Rabbit commands:

```
// Удаление, скачивание rabbitmq
sudo service rabbitmq-server stop
sudo apt-get remove rabbitmq-server
sudo apt-get install rabbitmq-server=3.12.*
sudo service rabbitmq-server start
rabbitmqctl status

// Просмотр, добавление плагинов
rabbitmq-plugins list
rabbitmq-plugins enable rabbitmq_management

// Просмотр, добавление пользователя
rabbitmqctl list_users
rabbitmqctl add_user thebigrabbit MyS3cur3Passwor_d
rabbitmqctl set_user_tags rabbitadmin administrator
rabbitmqctl delete_user guest

// Виртуальный хост
rabbitmqctl list_vhosts
rabbitmqctl add_vhost cherry_broker
rabbitmqctl delete_vhost /

// Assign User Permissions on a Virtual Host
sudo rabbitmqctl set_permissions -p <virtual_host> <user_name> <permissions>
sudo rabbitmqctl set_permissions -p cherry_broker thebigrabbit ".*" ".*" ".*"
sudo rabbitmqctl list_permissions -p cherry_broker
```