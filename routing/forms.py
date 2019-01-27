from flask_wtf import FlaskForm
from wtforms import fields, validators


class AuthForm(FlaskForm):
    userField = fields.StringField(label='userField', validators=[validators.length(3)])
    passwordField = fields.StringField(label='passwordField', validators=[validators.length(3)])

    def __repr__(self):
        return f'{self.userField} {self.passwordField}'
